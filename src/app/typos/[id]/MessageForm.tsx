"use client";

import LoadingBar from "@/components/LoadingBar";
import { useChat } from "@/hooks/ChatContext";
import { Session } from "next-auth";
import { RefObject, UIEvent, useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import MessageInput from "./MessageInput";
import { sendMessage } from "./actions";
import { motion, useScroll } from "framer-motion";

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
	const [scrollDistanceToBottom, setScrollDistance] = useState(0);

	useEffect(() => {
		const callback = (e: Event) => {
			let el = e.target as HTMLElement;

			setScrollDistance(el.scrollHeight - el.scrollTop);
		};

		containerRef.current?.addEventListener("scroll", callback);

		return () => {
			containerRef.current?.removeEventListener("scroll", callback);
		};
	}, [containerRef]);

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
				className={`${
					scrollDistanceToBottom > 1000
						? "opacity-100 pointer-events-all translate-y-0"
						: "opacity-0 pointer-events-none -translate-y-2"
				} bg-black text-white p-1.5 z-10 cursor-pointer transition-all absolute right-6 md:right-10 -top-6`}
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
