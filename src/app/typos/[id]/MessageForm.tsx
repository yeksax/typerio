"use client";

import LoadingBar from "@/components/LoadingBar";
import { useChat } from "@/hooks/ChatContext";
import { Session } from "next-auth";
import { RefObject, UIEvent, useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import MessageInput from "./MessageInput";
import { sendMessage } from "./actions";
import { AnimatePresence, motion, useScroll } from "framer-motion";

interface Props {
	session: Session;
	chatId: string;
	containerRef: RefObject<HTMLDivElement>;
}

export default function MessageForm({ session, chatId, containerRef }: Props) {
	const [sending, setSending] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const chatContext = useChat();

	return (
		<form
			className='absolute bottom-0 left-0 px-4 md:px-8 pb-4 pr-6 md:pr-10 pt-2 flex items-center w-full'
			ref={formRef}
			onSubmit={(e) => {
				setSending(true);
			}}
			action={async (e) => {
				await sendMessage(e, chatId, chatContext.currentMention);
				setSending(false);
				formRef.current?.reset();
				chatContext.setCurrentMention(null);
			}}
		>
			<AnimatePresence>
				<GoToBottom containerRef={containerRef} />
			</AnimatePresence>
			<div className='border-black dark:border-zinc-950 dark:bg-zinc-900 overflow-hidden bg-white rounded-md border-4 border-t-2 py-2 px-4 w-full h-fit flex items-center relative gap-4'>
				<MessageInput sending={sending} />
				<LoadingBar position='bottom' listener='sending-message' />
			</div>
		</form>
	);
}

function GoToBottom({
	containerRef,
}: {
	containerRef: RefObject<HTMLDivElement>;
}) {
	const [scrollDistanceToBottom, setScrollDistance] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		const callback = (e: Event) => {
			let el = e.target as HTMLElement;
			setScrollDistance(el.scrollHeight - (el.scrollTop + innerHeight));
		};
		containerRef.current?.addEventListener("scroll", callback);

		return () => {
			containerRef.current?.removeEventListener("scroll", callback);
		};
	}, [containerRef]);

	return (
		<>
			{scrollDistanceToBottom > 250 && (
				<motion.div
					initial={{
						opacity: 0,
						y: -8,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					exit={{
						opacity: 0,
						y: -8,
					}}
					drag
					onDragStart={() => setIsDragging(true)}
					onDragEnd={() => setIsDragging(false)}
					dragSnapToOrigin
					dragMomentum={false}
					onClick={(e) => {
						if (!isDragging)
							containerRef.current!.scrollTo({
								top: containerRef.current!.scrollHeight,
								behavior: "smooth",
							});
					}}
					className={`z-10 absolute right-6 md:right-10 -top-8`}
				>
					<FiChevronDown
						size={14}
						className={`dark:bg-zinc-900 dark:border-zinc-950 bg-white border-b-4 rounded-md border-black cursor-pointer min-w-[1rem] p-1 box-content border-2 border-r-4`}
					/>
				</motion.div>
			)}
		</>
	);
}
