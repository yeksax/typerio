"use client";

import { creatorFiles, creatorFloat, creatorText } from "@/atoms/creatorAtom";
import { resizeTextarea } from "@/utils/client/styling";
import { blobToDataURI, dataURItoBlob } from "@/utils/general/files";
import { User } from "@prisma/client";
import { useAtom } from "jotai";
import { MutableRefObject, useEffect, useRef } from "react";

export default function CreatorInput({
	user,
	inputRef,
}: {
	user: User;
	inputRef: MutableRefObject<HTMLTextAreaElement | undefined>;
}) {
	const submitButton = useRef<HTMLButtonElement>();
	const [files, setFiles] = useAtom(creatorFiles);
	const [postText, setPostText] = useAtom(creatorText);
	const [isCreatorFloating, setCreatorFloatingState] = useAtom(creatorFloat);

	useEffect(() => {
		inputRef.current!.parentElement!.parentElement!.onsubmit = (
			ev: SubmitEvent
		) => {
			// ev.currentTarget!.reset()
		};
	}, [inputRef]);

	useEffect(() => {
		if (files.length > 4) {
			setFiles(files.slice(0, 4));
		}
	}, [files]);

	function shortcutHandler(e: any) {
		if (e.key === "Escape") {
			setCreatorFloatingState(false);
		} else if (e.ctrlKey && e.key === "Enter") {
			e.preventDefault();
			submitButton.current!.click();
		}
	}

	async function pasteHandler(e: React.ClipboardEvent<HTMLTextAreaElement>) {
		let newFiles = e.clipboardData.files;

		if (newFiles.length) {
			for (let i = 0; i < newFiles.length; i++) {
				let file = newFiles[i];

				blobToDataURI(file, (dataUrl: string) => {
					setFiles((prevFiles) => [
						...prevFiles,
						{
							dataUrl,
							file,
							id:
								new Date().getTime() +
								`${i} ${Math.random().toString()}`,
							name: newFiles[i].name,
							size: newFiles[i].size,
						},
					]);
				});
			}
		}
	}

	useEffect(() => {
		resizeTextarea(inputRef.current!);
	}, [postText]);

	return (
		<>
			<button
				type='submit'
				className='hidden'
				// @ts-ignore
				ref={submitButton}
			></button>
			<textarea
				onKeyDown={shortcutHandler}
				// @ts-ignore
				ref={inputRef}
				name='content'
				value={postText}
				onInput={(e) => setPostText(e.currentTarget.value)}
				onPaste={pasteHandler}
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
