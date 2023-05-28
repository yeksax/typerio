"use client";

import { User } from "@prisma/client";
import { useEffect, useRef } from "react";

export default function CreatorInput({ user, pretyped }: { user: User, pretyped: string }) {
	const submitButton = useRef<HTMLButtonElement>();
	const inputRef = useRef<HTMLTextAreaElement>();

	function resize(e: any) {
		e.target.style.height = "1lh";
		e.target.style.height = e.target.scrollHeight + "px";
	}

	useEffect(() => {
		inputRef.current!.parentElement!.parentElement!.onsubmit = (ev: SubmitEvent)=>{
			// ev.currentTarget!.reset()
		}
	}, [inputRef])
	
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
				className='resize-none box-content outline-none text-sm typer-scroll'
				defaultValue={pretyped}
				style={{
					height: "1lh",
					maxHeight: "4lh",
				}}
				placeholder={`O que ${user.name} anda pensando?`}
			></textarea>
		</>
	);
}
