"use client";

import { pusherClient } from "@/services/pusher";
import { _Chat, _Message } from "@/types/interfaces";
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
	unreadMessages: number;
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
	unreadMessages: 0,
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
	const [unreadMessages, setUnreadMessages] = useState<number>(0);
	const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
		null
	);

	const path = usePathname();

	const [isSidebarVisible, setSidebarVisibility] = useState(true);
	const [isLoading, setLoadingState] = useState(true);
	const { data: session } = useSession();

	useEffect(() => {
		if (path.split("/")[1] != "typos") setCurrentChat(null);
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
			setChatHistory(await r.json());
			setLoadingState(false);
		});
	}, []);

	useEffect(() => {
		if (!session) return;
		if (!session.user) return;

		setUnreadMessages(
			getUnreadMessages(
				chatHistory.map((c) => c.messages),
				session.user.id
			)
		);
	}, [session]);

	useEffect(() => {
		document.addEventListener(
			"keydown",
			({ ctrlKey, shiftKey, altKey, key }) => {
				if (key == "b" && ctrlKey) {
					setSidebarVisibility((prev) => !prev);
				}
			}
		);

		if (currentChat) {
			let currentChatData = chatHistory.find(
				(c) => c.id === currentChat.id
			);
			if (currentChatData) {
				setUnreadMessages(
					(prev) =>
						prev -
						currentChatData?.messages.filter(
							(m) =>
								!m.readBy
									?.map((u) => u.id)
									.includes(session!.user!.id)
						).length!
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

		chatHistory.forEach((chat) => {
			let channel = `chat__${chat.id}`;

			pusherClient
				.subscribe(channel)
				.bind("new-message", (data: _Message) => {
					let currentData = chatHistory.find((c) => c.id === chat.id);
					currentData?.messages.push(data);

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

			chatHistory.forEach((chat) => {
				let channel = `chat__${chat.id}`;
				pusherClient.unsubscribe(channel);
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentChat, session]);

	function appendNewChat(chat: _Chat) {
		setChatHistory((prev) => [chat, ...prev]);
	}

	return (
		<chatContext.Provider
			value={{
				unreadMessages,
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
