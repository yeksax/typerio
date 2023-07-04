"use client";

import LoadingBar from "@/components/LoadingBar";
import { useChat } from "@/hooks/ChatContext";
import { Session } from "next-auth";
import { RefObject, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import MessageInput from "./MessageInput";
import { sendMessage } from "./actions";
import { motion } from "framer-motion";

interface Props {
	session: Session;
	chatId: string;
	containerRef: RefObject<HTMLDivElement>;
}

export default function MessageForm({ session, chatId, containerRef }: Props) {
	const [sending, setSending] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const chatContext = useChat();
	const [isDragging, setIsDragging] = useState(false);

	return (
		<form
			className='absolute bottom-0 left-0 px-4 md:px-8 pb-4 pr-6 md:pr-10 pt-2 flex items-center w-full'
			ref={formRef}
			onSubmit={(e) => {
				setSending(true);
			}}
			action={async (e) => {
				await sendMessage(
					e,
					session.user!.id,
					chatId,
					chatContext.currentMention
				);
				setSending(false);
				formRef.current?.reset();
				chatContext.setCurrentMention(null);
			}}
		>
			<motion.div
				drag
				onDragStart={() => setIsDragging(true)}
				onDragEnd={() => setIsDragging(false)}
				dragMomentum={false}
				onClick={(e) => {
					if (!isDragging)
						containerRef.current!.scrollTo({
							top: containerRef.current!.scrollHeight,
							behavior: "smooth",
						});
				}}
				className={`bg-black text-white p-1.5 z-10 cursor-pointer absolute right-6 md:right-10 -top-6`}
			>
				<FiChevronDown size={12} />
			</motion.div>
			<div className='border-black bg-white rounded-md border-2 py-2 px-4 w-full h-fit flex items-center relative gap-4'>
				<MessageInput sending={sending} />
				<LoadingBar position='bottom' listener='sending-message' />
			</div>
		</form>
	);
}
