"use client";

import { useChat } from "@/contexts/ChatContext";
import { useUser } from "@/contexts/UserContext";
import { useScroll } from "framer-motion";
import { useEffect, useRef } from "react";
import { FiLoader, FiSend, FiX } from "react-icons/fi";

interface Props {
	sending: boolean;
}

export default function MessageInput({ sending }: Props) {
	const submitButton = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const user = useUser();
	const chat = useChat();
	const { currentMention: mention } = chat;

	function resize(e: HTMLElement) {
		e.style.height = "1lh";
		e.style.height = e.scrollHeight + "px";
	}

	function shortcutHandler(e: any) {
		if (e.ctrlKey && e.key === "Enter") {
			e.preventDefault();
			submitButton.current!.click();
		}
		if (e.key === "Escape") {
			chat.setCurrentMention(null);
		}
	}

	useEffect(() => {
		if (mention) inputRef.current!.focus();
	}, [mention]);

	useEffect(() => resize(inputRef.current!), [mention, sending]);

	return (
		<div className='flex flex-col gap-2 w-full'>
			{mention && (
				<div className='border-l-2 border-gray-600 pl-2 text-gray-700 text-xs w-full'>
					<span className='font-semibold flex justify-between'>
						{mention.author.name}
						<FiX
							size={16}
							className='cursor-pointer'
							onClick={() => {
								chat.setCurrentMention(null);
							}}
						/>
					</span>
					<pre className='truncate break-all'>{mention.content}</pre>
				</div>
			)}
			<div className='flex gap-4 items-end relative'>
				{sending && (
					<div
						className='absolute left-0'
						style={{
							top: "0.175rem",
						}}
					>
						<FiLoader className='animate-spin' />
					</div>
				)}
				<textarea
					onChange={(e) => resize(e.target)}
					onKeyDown={shortcutHandler}
					disabled={sending}
					ref={inputRef}
					autoFocus
					name='content'
					className={`${
						sending ? "indent-6 text-gray-600" : ""
					} resize-none box-border overflow-y-auto w-full outline-none text-sm`}
					style={{
						height: "1lh",
						maxHeight: "4lh",
					}}
					placeholder={`O que ${
						user ? user.name : "você"
					} anda pensando?`}
				></textarea>
				<button className='h-5' type='submit' ref={submitButton}>
					<FiSend size={20} className='cursor-pointer' />
				</button>
			</div>
		</div>
	);
}
