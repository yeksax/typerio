"use client";

import { creatorFloat, creatorText } from "@/atoms/creatorAtom";
import { User } from "@prisma/client";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export default function CreatorInput({ user }: { user: User }) {
	const submitButton = useRef<HTMLButtonElement>();
	const inputRef = useRef<HTMLTextAreaElement>();
	const [postText, setPostText] = useAtom(creatorText);
	const [isCreatorFloating, setCreatorFloatingState] = useAtom(creatorFloat);

	function resize(e: any) {
		e.target.style.height = "1lh";
		e.target.style.height = e.target.scrollHeight + "px";
	}

	useEffect(() => {
		inputRef.current!.parentElement!.parentElement!.onsubmit = (
			ev: SubmitEvent
		) => {
			// ev.currentTarget!.reset()
		};
	}, [inputRef]);

	function shortcutHandler(e: any) {
		if (e.key === "Escape") {
			setCreatorFloatingState(false);
		} else if (e.ctrlKey && e.key === "Enter") {
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
				value={postText}
				onInput={(e) => setPostText(e.currentTarget.value)}
				className='resize-none box-content outline-none break-words mt-2 text-sm typer-scroll'
				style={{
					height: "1lh",
					maxHeight: "4lh",
				}}
				placeholder={`O que ${user.name} anda pensando?`}
			></textarea>
		</>
	);
}
