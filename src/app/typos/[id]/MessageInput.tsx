"use client";

import { useUser } from "@/contexts/UserContext";
import { User } from "@prisma/client";
import { ChangeEvent, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";

export default function MessageInput() {
	const submitButton = useRef<HTMLButtonElement>();
	const inputRef = useRef<HTMLTextAreaElement>();
	const user = useUser();

	function resize(e: ChangeEvent<HTMLTextAreaElement>) {
		e.target.style.height = "1lh";
		e.target.style.height = e.target.scrollHeight+ "px";
    e.target.scrollTop = e.target.scrollHeight;
	}

	function shortcutHandler(e: any) {
		if (e.ctrlKey && e.key === "Enter") {
			e.preventDefault();
			submitButton.current!.click();
		}
	}

	return (
		<>
			<button
				type='submit'
				className='hidden'
				// @ts-ignore
				ref={submitButton}
			></button>
			<textarea
				onChange={resize}
				onKeyDown={shortcutHandler}
				// @ts-ignore
				ref={inputRef}
				name='content'
				className='resize-none box-border overflow-y-auto w-full outline-none text-sm'
				style={{
					height: "1lh",
					maxHeight: "4lh",
				}}
				placeholder={`O que ${
					user ? user.name : "você"
				} anda pensando?`}
			></textarea>
		</>
	);
}
