"use client";

import { FiLoader, FiSend } from "react-icons/fi";
import MessageInput from "./MessageInput";
import { sendMessage } from "./actions";
import { Session } from "next-auth";
import LoadingBar from "@/components/LoadingBar";
import { useRef, useState } from "react";
import { useChat } from "@/contexts/ChatContext";

interface Props {
	session: Session;
	chatId: string;
}

export default function MessageForm({ session, chatId }: Props) {
	const [sending, setSending] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const chat = useChat()

	return (
		<form
			className='absolute bottom-0 left-0 px-8 pb-4 pt-2 flex items-center w-full'
			ref={formRef}
			onSubmit={(e) => {
				setSending(true);
			}}
			action={async (e) => {
				await sendMessage(e, session.user!.id, chatId, chat.currentMention);
				setSending(false);
				formRef.current?.reset();
				chat.setCurrentMention(null);
			}}
		>
			<div className='border-black bg-white rounded-md border-2 py-2 px-4 w-full h-fit flex items-center relative gap-4'>
				<MessageInput sending={sending} />
				<LoadingBar position='bottom' listener='sending-message' />
			</div>
		</form>
	);
}
