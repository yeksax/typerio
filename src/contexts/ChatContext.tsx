"use client";

import { pusherClient } from "@/services/pusher";
import { _Chat, _Message } from "@/types/interfaces";
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
	appendNewChat: (chat: _Chat) => void;
	setSidebarVisibility: (should: boolean) => void;
	setCurrentChat: (chat: _Chat | null) => void;
	setCurrentMention: (mention: _Message | null) => void;
}

export const chatContext = createContext<IChatContext>({
	isLoading: true,
	chatHistory: [],
	currentChat: null,
	currentMention: null,
	isSidebarVisible: true,
	appendNewChat: () => {},
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

	const [isSidebarVisible, setSidebarVisibility] = useState(false);
	const [isLoading, setLoadingState] = useState(true);

	useEffect(() => {
		fetch("/api/user/me/chats").then(async (r) => {
			setChatHistory(await r.json());
			setLoadingState(false);
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

		if (currentChat) {
			let currentChatData = chatHistory.find(
				(c) => c.id === currentChat.id
			);
			if (currentChatData) {
				setChatHistory(
					chatHistory.map((c) =>
						c.id === currentChat.id ? currentChatData! : c
					)
				);
			}
		}

		chatHistory.forEach((chat) => {
			let channel = `chat__${chat.id}`;

			pusherClient
				.subscribe(channel)
				.bind("new-message", (data: _Message) => {
					let currentData = chatHistory.find((c) => c.id === chat.id);
					currentData?.messages.push(data);

					setChatHistory([
						currentData!,
						...chatHistory.filter((c) => c.id !== chat.id),
					]);
				});
		});

		return () => {
			chatHistory.forEach((chat) => {
				let channel = `chat__${chat.id}`;
				pusherClient.unsubscribe(channel);
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentChat]);

	function appendNewChat(chat: _Chat) {
		setChatHistory((prev) => [chat, ...prev]);
	}

	return (
		<chatContext.Provider
			value={{
				appendNewChat,
				isLoading,
				currentChat,
				setCurrentChat,
				currentMention,
				setCurrentMention,
				isSidebarVisible,
				setSidebarVisibility,
				chatHistory,
			}}
		>
			{children}
		</chatContext.Provider>
	);
}

export const useChat = () => useContext(chatContext);
