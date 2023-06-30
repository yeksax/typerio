"use client";

import { useChat } from "@/hooks/ChatContext";
import { _Chat } from "@/types/interfaces";
import { Session } from "next-auth";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageForm from "./MessageForm";
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
