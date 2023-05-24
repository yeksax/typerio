import { _Post } from "@/types/interfaces";
import { reply } from "./actions";
import { useEffect, useRef } from "react";

interface Props {
	post: _Post;
	user: string;
	focus: boolean;
}

export default function Reply({ post, user, focus }: Props) {
	const formRef = useRef<HTMLFormElement>();
	const submitButton = useRef<HTMLButtonElement>();
	const inputRef = useRef<HTMLTextAreaElement>();

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
		if (focus) inputRef.current?.focus()
    else inputRef.current?.blur();
	}, [focus]);

	return (
		<form
			//@ts-ignore
			ref={formRef}
			className='mt-2 flex flex-col gap-2 items-end'
			action={async (e) => {
				await reply(post.id, user, e);
				formRef.current?.reset();
			}}
		>
			<textarea
				className='resize-none border-l-2 border-l-gray-700 pl-4 outline-none text-sm typer-scroll w-full'
				onChange={resize}
				onKeyDown={shortcutHandler}
				//@ts-ignore
				ref={inputRef}
				name='content'
				placeholder={`Responda ${post.author.name}...`}
				style={{
					height: "1lh",
					maxHeight: "4lh",
				}}
			></textarea>
			<button
				type='submit'
				//@ts-ignore
				ref={submitButton}
				className='w-fit bg-white text-black px-2 border-2 border-black py-0.5 rounded-md text-xs hover:bg-black hover:text-white font-bold hover:font-medium transition-all'
			>
				Enviar
			</button>
		</form>
	);
}
