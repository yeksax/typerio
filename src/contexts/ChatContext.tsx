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
	setCurrentChat: (chat: _Chat) => void;
}

export const chatContext = createContext<IChatContext>({
	chatHistory: [],
	currentChat: null,
	setCurrentChat: () => {},
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

	useEffect(() => {
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
			pusherClient.unsubscribe(channel);
			pusherClient
				.subscribe(channel)
				.bind("new-message", (data: _Message) => {
					let currentData = chatHistory.find((c) => c.id === chat.id);

					currentData!.lastMessage = {
						author: data.author.name,
						content: data.content,
						timestamp: data.createdAt,
					};
					currentData!.messages = [...currentData!.messages, data];

					setChatHistory([
						currentData!,
						...chatHistory.filter((c) => c.id !== chat.id),
					]);
				});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentChat]);

	return (
		<chatContext.Provider
			value={{
				currentChat,
				setCurrentChat,
				chatHistory,
			}}
		>
			{children}
		</chatContext.Provider>
	);
}

export const useChat = () => useContext(chatContext);
