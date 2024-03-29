"use client";

import { creatorFiles, creatorFloat, creatorText } from "@/atoms/creatorState";
import { uploadFiles } from "@/services/uploadthing";
import { User } from "@prisma/client";
import { useAtom } from "jotai";
import Image from "next/image";
import { useRef, useState } from "react";
import { FiImage, FiMinimize2 } from "react-icons/fi";
import { TbGripHorizontal } from "react-icons/tb";
import LoadingBar from "../LoadingBar";
import ImagePreview from "./ImagePreview";
import CreatorInput from "./PostInput";
import { createPost } from "./actions";

interface Props {
	user: User;
}

export default function PostCreator({ user }: Props) {
	const formRef = useRef<HTMLFormElement>();
	const inputRef = useRef<HTMLTextAreaElement>();

	const [postLoading, setPostLoading] = useState<boolean>(false);

	const [files, setFiles] = useAtom(creatorFiles);

	const [isFloating, setFloating] = useAtom(creatorFloat);
	const [postText, setPostText] = useAtom(creatorText);

	async function postSomething(e: FormData) {
		setPostLoading(true);
		let fileUrls: string[] = [];

		if (files.length > 0) {
			await fetch("/api/pusher/updateStatus", {
				method: "POST",
				body: JSON.stringify({
					percent: 5,
					channel: `${user.id}__post-loading`,
				}),
				cache: "no-store",
			});
			let res = await uploadFiles({
				endpoint: "postFileUploader",
				files: files.map((f) => f.file),
			});

			fileUrls = res.map((r) => r.fileUrl);
			await fetch("/api/pusher/updateStatus", {
				method: "POST",
				body: JSON.stringify({
					percent: 20,
					channel: `${user.id}__post-loading`,
				}),
				cache: "no-store",
			});
		}

		await createPost(e, fileUrls);
		formRef.current?.reset();
		setPostLoading(false);
		setPostText("");
		setFiles([]);
	}

	return (
		<div
			className={`bg-white dark:bg-zinc-900 flex flex-col relative px-6 py-6 md:px-8`}
		>
			<LoadingBar
				key={new Date().getTime()}
				listener='post-loading'
				position='top'
			/>
			{isFloating && (
				<div className='flex justify-between w-full items-center relative -top-1 md:-top-2'>
					<span className='w-4'></span>
					<TbGripHorizontal
						className='text-gray-500 cursor-grab active:cursor-grabbing'
						size={16}
					/>
					<FiMinimize2
						className='cursor-pointer'
						size={12}
						onClick={() => setFloating(false)}
					/>
				</div>
			)}
			<form
				className={`flex gap-4 w-full relative`}
				// @ts-ignore
				ref={formRef}
				action={async (e) => {
					await postSomething(e);
				}}
			>
				<Image
					src={user?.avatar}
					width={50}
					height={50}
					className='rounded-md w-9 h-9 aspect-square object-cover border-2 border-black'
					alt='profile picture'
				/>
				<div className='flex flex-col w-full'>
					<div className='flex flex-col justify-between'>
						<h3 className='text-sm opacity-90'>
							Postando como {user.displayName || user.name}
						</h3>
						<h4 className='text-xs opacity-75'>
							{user.name}#{user.tag}
						</h4>
					</div>
					<CreatorInput inputRef={inputRef} user={user} />

					<div className='w-full overflow-x-auto py-2'>
						<div
							className={`w-full place-items-center grid gap-1 mt-1 h-fit grid-flow-row ${files.length > 1 ? "grid-cols-2" : ""
								}`}
						>
							{files.map((file, i) => (
								<ImagePreview
									colspan={files.length === 3 && i === 2}
									src={file.dataUrl}
									id={file.id}
									key={file.id}
								/>
							))}
						</div>
					</div>
					<div className='flex justify-between items-center'>
						<div className='flex gap-6 items-center'>
							<div
								className='icon-action'
								onClick={() => {
									document
										.getElementById("post-files-input")
										?.click();
								}}
							>
								<input
									type='file'
									name='files'
									id='post-files-input'
									accept='image/png, image/jpeg, image/webp, image/gif'
									multiple
									className='hidden'
									onChange={(e: any) => {
										e.preventDefault();
										let blobFiles: File[] = [];
										let currentFile = 0;

										if (e.dataTransfer) {
											blobFiles = e.dataTransfer.files;
										} else if (e.target.files) {
											blobFiles = e.target.files;
										}

										if (blobFiles.length == 0) return;

										const reader = new FileReader();
										reader.onload = () => {
											setFiles((prev) => [
												...prev,
												{
													id: (
														new Date().getTime() *
														Math.random()
													).toString(),
													file: blobFiles[
														currentFile
													],
													size: blobFiles[currentFile]
														.size,
													name: blobFiles[currentFile]
														.name,
													dataUrl:
														reader.result as string,
												},
											]);
											try {
												if (files.length < 4) {
													reader.readAsDataURL(
														blobFiles[
														currentFile + 1
														]
													);
													currentFile++;
												}
											} catch { }
										};

										reader.readAsDataURL(blobFiles[0]);
									}}
								/>
								<span>
									<FiImage size={14} className='' />
								</span>
							</div>
						</div>
						<button
							type='submit'
							disabled={postLoading}
							className='bg-black dark:hover:text-white dark:hover:border-white text-white px-2 border-2 border-black py-0.5 rounded-md text-xs hover:bg-transparent hover:text-black hover:font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed'
						>
							{postLoading ? "Enviando..." : "Enviar"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
