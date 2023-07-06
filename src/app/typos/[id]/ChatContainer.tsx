"use client";

import { useChat } from "@/hooks/ChatContext";
import { _Chat } from "@/types/interfaces";
import { Session } from "next-auth";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageForm from "./MessageForm";
import MessagesContainer from "./MessagesContainer";
import { readMessages } from "./actions";
import { FiLoader } from "react-icons/fi";

interface Props {
	chat: _Chat;
	session: Session;
}

export default function ChatContainer({ chat, session }: Props) {
	const chatContext = useChat();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chatContext.isLoading) {
			let chatExists =
				chatContext.chatHistory.find((c) => c.id === chat.id) !=
				undefined;

			if (chatExists) chatContext.setCurrentChat(chat);

			let unreadMessages = chat.messages.map((m) => m.id);
			readMessages(unreadMessages, session.user!.id);
		}
	}, [chatContext.isLoading, chatContext.chatHistory, chat]);

	useEffect(() => {
		chatContext.setCurrentMention(null);
	}, []);

	return (
		<div className='flex flex-col flex-1 relative'>
			<ChatHeader chat={chat} session={session!} />
			{chatContext.isLoading ? (
				<div className='flex-1 h-full grid place-items-center'>
					<FiLoader className='animate-spin' size={24} />
				</div>
			) : (
				<>
					<MessagesContainer
						containerRef={containerRef}
						session={session}
						chat={chat.id}
					/>
					<MessageForm
						containerRef={containerRef}
						session={session!}
						chatId={chat.id}
					/>
				</>
			)}
		</div>
	);
}
