"use client";

import { unreadMessagesAtom } from "@/atoms/notificationsState";
import { pusherClient } from "@/services/pusher";
import { _Chat, _Message } from "@/types/interfaces";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
	ReactNode,
	createContext,
	useCallback,
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

	const shortcutHandler = useCallback(
		({ ctrlKey, shiftKey, altKey, key }: KeyboardEvent) => {
			if (key == "b" && ctrlKey) {
				setSidebarVisibility((prev) => !prev);
			}
		},
		[isSidebarVisible]
	);

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
		document.addEventListener("keydown", shortcutHandler);

		if (!session) return;

		if (currentChat) {
			let currentChatData: _Chat | undefined = chatHistory.find(
				(c) => c.id === currentChat.id
			);

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
					chatHistory
						.filter((c) => c != undefined)
						.map((c) =>
							c.id === currentChat.id ? currentChatData! : c
						)
				);
			}
		}

		pusherClient
			.subscribe(`user__${session?.user?.id}__chats`)
			.bind("new-chat", (body: _Chat) => {
				if (body != undefined)
					setChatHistory((prev) => [body, ...prev]);
			});

		return () => {
			document.removeEventListener("keydown", shortcutHandler);
			pusherClient.unsubscribe(`user__${session?.user?.id}__chats`);
		};
	}, [currentChat, session, isLoading]);

	useEffect(() => {
		if (!session) return;

		chatHistory.forEach((chat) => {
			let channelName = `chat__${chat.id}`;

			let channel = pusherClient.channel(`chat__${chat.id}`);

			if (!channel) {
				channel = pusherClient.subscribe(channelName);
				channel.bind("new-message", (data: _Message) => {
					let currentData = chatHistory.find(
						(c) => c.id === data.chatId
					);

					currentData?.messages.push(
						data.chatId === currentChat?.id
							? {
									...data,
									readBy: [
										...data.readBy!,
										{ id: session.user.id },
									],
							  }
							: data
					);

					setUnreadMessages((prev) =>
						data.authorId === session.user.id ||
						data.chatId === currentChat?.id
							? prev
							: prev + 1
					);

					if (currentData != undefined)
						setChatHistory([
							currentData,
							...chatHistory.filter((c) => c.id !== chat.id),
						]);
				});
			}
		});
	}, [chatHistory, currentChat, session, isLoading]);

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
