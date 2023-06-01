"use client";

import { useChat } from "@/contexts/ChatContext";
import { useUser } from "@/contexts/UserContext";
import { useScroll } from "framer-motion";
import { useEffect, useRef } from "react";
import { FiLoader, FiSend } from "react-icons/fi";

interface Props {
	sending: boolean;
}

export default function MessageInput({ sending }: Props) {
	const submitButton = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const user = useUser();
	const { currentMention: mention } = useChat();

	function resize(e: any) {
		e.target.style.height = "1lh";
		e.target.style.height = e.target.scrollHeight + "px";
	}

	function shortcutHandler(e: any) {
		if (e.ctrlKey && e.key === "Enter") {
			e.preventDefault();
			submitButton.current!.click();
		}
	}

	useEffect(() => {
		if (mention) inputRef.current!.focus();
	}, [mention]);

	return (
		<div className='flex flex-col gap-2 w-full'>
			{mention && (
				<div className='border-l-2 border-gray-600 pl-2 text-gray-700 text-xs'>
					<span className='font-semibold'>{mention.author.name}</span>
					<pre className='line-clamp-1'>{mention.content}</pre>
				</div>
			)}
			<div className='flex relative'>
				{sending && (
					<div className='absolute left-0 top-1/2 -translate-y-1/2'>
						<FiLoader className='animate-spin' />
					</div>
				)}
				<textarea
					onChange={resize}
					onKeyDown={shortcutHandler}
					disabled={sending}
					ref={inputRef}
					name='content'
					className={`${
						sending ? "indent-8 text-gray-600" : ""
					} resize-none box-border overflow-y-auto w-full outline-none text-sm`}
					style={{
						height: "1lh",
						maxHeight: "4lh",
					}}
					placeholder={`O que ${
						user ? user.name : "você"
					} anda pensando?`}
				></textarea>
				<button type='submit' ref={submitButton}>
					<FiSend size={20} className='cursor-pointer' />
				</button>
			</div>
		</div>
	);
}
