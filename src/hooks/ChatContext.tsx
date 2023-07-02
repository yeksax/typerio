"use client";

import { unreadMessagesAtom } from "@/atoms/notificationsAtom";
import { pusherClient } from "@/services/pusher";
import { _Chat, _Message } from "@/types/interfaces";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface IChatContext {
	isLoading: boolean;
	chatHistory: _Chat[];
	currentChat: _Chat | null;
	currentMention: _Message | null;
	isSidebarVisible: boolean;
	currentAudio: HTMLAudioElement | null;
	appendNewChat: (chat: _Chat) => void;
	setCurrentAudio: (audio: HTMLAudioElement | null) => void;
	setSidebarVisibility: (should: boolean) => void;
	setCurrentChat: (chat: _Chat | null) => void;
	setChatHistory: (chat: _Chat[]) => void;
	setCurrentMention: (mention: _Message | null) => void;
}

export const chatContext = createContext<IChatContext>({
	isLoading: true,
	chatHistory: [],
	currentChat: null,
	currentMention: null,
	isSidebarVisible: true,
	currentAudio: null,
	setCurrentAudio: () => {},
	appendNewChat: () => {},
	setChatHistory: () => {},
	setCurrentChat: () => {},
	setCurrentMention: () => {},
	setSidebarVisibility: () => {},
});

interface Props {
	children: ReactNode;
}

export default function ChatProvider({ children }: Props) {
	const [chatHistory, setChatHistory] = useState<_Chat[]>([]);
	const [currentChat, setCurrentChat] =
		useState<IChatContext["currentChat"]>(null);
	const [currentMention, setCurrentMention] = useState<_Message | null>(null);
	const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);
	const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
		null
	);

	const path = usePathname();

	const [isSidebarVisible, setSidebarVisibility] = useState(true);
	const [isLoading, setLoadingState] = useState(true);
	const { data: session } = useSession();

	useEffect(() => {
		if (path.split("/").length < 3) setCurrentChat(null);
	}, [path]);

	function getUnreadMessages(msgs: _Message[][], userID: string) {
		let initialValue = 0;
		let unreadMessages = msgs.reduce(
			(acc, messages) =>
				acc +
				messages.filter((message) => {
					let readBy = message.readBy?.map(
						(user) => user.id
					) as string[];

					return !readBy.includes(userID);
				}).length,
			initialValue
		);

		return unreadMessages;
	}

	useEffect(() => {
		fetch("/api/user/me/chats").then(async (r) => {
			setLoadingState(false);

			if (r.status === 403) return;

			const { chats, user }: { chats: _Chat[]; user: string } =
				await r.json();

			setChatHistory(chats);
			setUnreadMessages(
				getUnreadMessages(
					chats.map((chat) => chat.messages),
					user
				)
			);
		});
	}, []);

	useEffect(() => {
		document.addEventListener(
			"keydown",
			({ ctrlKey, shiftKey, altKey, key }) => {
				if (key == "b" && ctrlKey) {
					setSidebarVisibility((prev) => !prev);
				}
			}
		);

		if (!session) return;

		if (currentChat) {
			let currentChatData: _Chat | undefined = chatHistory.find(
				(c) => c.id === currentChat.id
			);

			if (!currentChatData) {
				setChatHistory((prev) => [currentChat, ...prev]);
			}

			if (currentChatData) {
				setUnreadMessages(
					(prev) =>
						prev -
						getUnreadMessages(
							[currentChatData!.messages],
							session!.user!.id
						)
				);

				currentChatData.messages = currentChatData.messages.map(
					(m) => ({
						...m,
						readBy: [...m.readBy!, { id: session!.user!.id }],
					})
				);

				setChatHistory(
					chatHistory.map((c) =>
						c.id === currentChat.id ? currentChatData! : c
					)
				);
			}
		}

		pusherClient
			.subscribe(`user__${session?.user?.id}__chats`)
			.bind("new-chat", (body: _Chat) => {
				setChatHistory((prev) => [body, ...prev]);
			});

		let visitedChannels: string[] = [];

		[...chatHistory, currentChat].forEach((chat) => {
			if (chat === null) return;
			if (visitedChannels.includes(chat.id)) return;
			visitedChannels.push(chat.id);

			let channel = `chat__${chat.id}`;

			pusherClient
				.subscribe(channel)
				.bind("new-message", (data: _Message) => {
					let currentData = chatHistory.find((c) => c.id === chat.id);
					currentData?.messages.push(
						data.chatId === currentChat?.id
							? {
									...data,
									readBy: [
										...data.readBy!,
										{ id: session.user!.id },
									],
							  }
							: data
					);

					setUnreadMessages((prev) =>
						data.chatId === currentChat?.id ? prev : prev + 1
					);

					setChatHistory([
						currentData!,
						...chatHistory.filter((c) => c.id !== chat.id),
					]);
				});
		});

		return () => {
			pusherClient.unsubscribe(`user__${session?.user?.id}__chats`);

			visitedChannels.forEach((chat) => {
				let channel = `chat__${chat}`;
				pusherClient.unsubscribe(channel);
			});
		};
	}, [currentChat, session]);

	function appendNewChat(chat: _Chat) {
		setChatHistory((prev) => [chat, ...prev]);
	}

	return (
		<chatContext.Provider
			value={{
				appendNewChat,
				isLoading,
				chatHistory,
				currentChat,
				currentAudio,
				currentMention,
				isSidebarVisible,
				setChatHistory,
				setCurrentChat,
				setCurrentAudio,
				setCurrentMention,
				setSidebarVisibility,
			}}
		>
			{children}
		</chatContext.Provider>
	);
}

export const useChat = () => useContext(chatContext);
