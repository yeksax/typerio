"use client";

import { Session } from "next-auth";
import ChatHeader from "./ChatHeader";
import MessageForm from "./MessageForm";
import { _Chat } from "@/types/interfaces";
import { useChat } from "@/hooks/ChatContext";
import { useEffect, useRef } from "react";
import MessagesContainer from "./MessagesContainer";

interface Props {
	chat: _Chat;
	session: Session;
}

export default function ChatContainer({ chat, session }: Props) {
	const chatContext = useChat();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chatContext.isLoading) chatContext.setCurrentChat(chat);
	}, [chatContext.isLoading]);

	return (
		<div className='flex flex-col flex-1 relative'>
			<ChatHeader chat={chat} session={session!} />
			{chatContext.isLoading ? (
				"carregando"
			) : (
				<MessagesContainer
					containerRef={containerRef}
					session={session}
					chat={chat.id}
				/>
			)}
			<MessageForm
				session={session!}
				chatId={chat.id}
				containerRef={containerRef}
			/>
		</div>
	);
}
