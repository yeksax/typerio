"use client";

import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import { _Chat, _ChatHistory, _Message, _User } from "@/types/interfaces";
import { Chat } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface IChatContext {
	chatHistory: _ChatHistory[];
	currentChat: _Chat | null;
	currentMention: _Message | null;
	isSidebarVisible: boolean;
	setSidebarVisibility: (should: boolean) => void;
	setCurrentChat: (chat: _Chat | null) => void;
	setCurrentMention: (mention: _Message | null) => void;
}

export const chatContext = createContext<IChatContext>({
	chatHistory: [],
	currentChat: null,
	currentMention: null,
	isSidebarVisible: false,
	setSidebarVisibility: () => {},
	setCurrentChat: () => {},
	setCurrentMention: () => {},
});

interface Props {
	children: ReactNode;
	history: _ChatHistory[];
}

export default function ChatProvider({ history, children }: Props) {
	const [chatHistory, setChatHistory] =
		useState<IChatContext["chatHistory"]>(history);
	const [currentChat, setCurrentChat] =
		useState<IChatContext["currentChat"]>(null);
	const [currentMention, setCurrentMention] = useState<_Message | null>(null);
	const [isSidebarVisible, setSidebarVisibility] = useState(false);

	useEffect(() => {
		document.addEventListener('keydown', ({ ctrlKey, shiftKey, altKey, key }) => {
			if(key == 'b' && ctrlKey){
				setSidebarVisibility(prev => !prev)
			}
		})

		if (currentChat) {
			let currentChatData = chatHistory.find(
				(c) => c.id === currentChat.id
			);
			currentChatData!.unreadMessages = 0;
			setChatHistory(
				chatHistory.map((c) =>
					c.id === currentChat.id ? currentChatData! : c
				)
			);
		}

		chatHistory.forEach((chat) => {
			let channel = `chat__${chat.id}`;

			pusherClient
				.subscribe(channel)
				.unbind("new-message")
				.bind("new-message", (data: _Message) => {
					let currentData = chatHistory.find((c) => c.id === chat.id);

					currentData!.lastMessage = {
						author: data.author.name,
						content: data.content,
						timestamp: data.createdAt,
					};
					currentData!.messages = [...currentData!.messages, data];
					if (currentChat!.id !== data.chatId) {
						currentData!.unreadMessages += 1;
					}

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

	return (
		<chatContext.Provider
			value={{
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
