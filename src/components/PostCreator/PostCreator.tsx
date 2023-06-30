"use client";

import { pusherClient } from "@/services/pusher";
import { uploadFiles } from "@/services/uploadthing";
import { _Chat } from "@/types/interfaces";
import { User } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiCamera, FiImage, FiLink, FiMinimize2, FiX } from "react-icons/fi";
import LoadingBar from "../LoadingBar";
import GroupInvite from "./GroupInvite";
import ImagePreview from "./ImagePreview";
import CreatorInput from "./PostInput";
import { createPost } from "./actions";

interface Props {
	user: User;
}

export default function PostCreator({ user }: Props) {
	const formRef = useRef<HTMLFormElement>();
	const [postLoading, setPostLoading] = useState<boolean>(false);
	const { data: session } = useSession();

	const [isCreatingInvite, setInviteCreation] = useState<boolean>(false);
	const [invite, setInvite] = useState<_Chat | null>(null);
	const [inviteCode, setInviteCode] = useState<string | null>(null);

	const [files, setFiles] = useState<{ id: string; file: string }[]>([]);
	const [isFloating, setFloating] = useState(false);

	const shortcutHandler = (e: KeyboardEvent) => {
		const { key, ctrlKey, shiftKey, altKey } = e;

		if ((e.target as HTMLElement).tagName === "BODY") {
			if (key === "n") {
				setFloating((prev) => !prev);
			}
		}
	};

	useEffect(() => {
		document.body.addEventListener("keydown", shortcutHandler);

		return () => {
			document.body.removeEventListener("keydown", shortcutHandler);
		};
	}, []);

	useEffect(() => {
		if (!session?.user) return;
		pusherClient.unsubscribe(`${session.user.id}__post-loading`);
		pusherClient
			.subscribe(`${session.user.id}__post-loading`)
			.bind("progress", (progress: number) => {
				setPostLoading(progress !== 0);
			});
	}, [session?.user]);

	async function postSomething(e: FormData) {
		let fileUrls: string[] = [];

		await fetch("/api/pusher/updateStatus", {
			method: "POST",
			body: JSON.stringify({
				percent: 5,
				channel: `${user.id}__post-loading`,
			}),
			cache: "no-store",
		});

		let blobFiles = e.getAll("files") as File[];

		if (files.length > 0) {
			let res = await uploadFiles({
				endpoint: "postFileUploader",
				files: blobFiles,
			});

			fileUrls = res.map((r) => r.fileUrl);
		}

		await fetch("/api/pusher/updateStatus", {
			method: "POST",
			body: JSON.stringify({
				percent: 20,
				channel: `${user.id}__post-loading`,
			}),
			cache: "no-store",
		});

		await createPost(e, user.id, fileUrls);
		formRef.current!.reset();
		setFiles([]);
	}

	return (
		<>
			<motion.div
				drag={isFloating}
				initial={{
					position: "initial",
				}}
				dragElastic={0}
				dragMomentum={false}
				animate={{
					position: isFloating ? "fixed" : "initial",
					scale: isFloating ? 1.05 : 1,
					transform: isFloating ? "" : "translate(0, 0)",
				}}
				className='z-20'
			>
				<div
					className={`${
						isFloating
							? "border-2 rounded-md md:w-[32rem] border-r-4 border-b-4"
							: "border-b-2"
					}  flex flex-col relative border-black bg-white overflow-hidden px-4 py-1.5 md:px-8 md:py-4 transition-all`}
				>
					<LoadingBar listener='post-loading' position='top' />
					{isFloating && (
						<div className='flex justify-end w-full'>
							<FiMinimize2
								className='cursor-pointer'
								onClick={() => setFloating(false)}
							/>
						</div>
					)}
					<form
						className={`flex gap-4 w-full relative`}
						// @ts-ignore
						ref={formRef}
						action={postSomething}
					>
						<input
							type='hidden'
							name='inviteCode'
							value={inviteCode || ""}
						/>
						<input
							type='hidden'
							name='inviteChat'
							value={invite?.id || ""}
						/>
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
									Postando como {user.name}
								</h3>
								<h4 className='text-xs opacity-75'>
									{user.name}#{user.tag}
								</h4>
							</div>
							<CreatorInput user={user} />
							<motion.div
								className='flex gap-2 md:gap-4 px-1 py-1 border-black border-2 rounded-lg'
								initial={{
									opacity: 0,
									marginTop: 0,
									marginBottom: 0,
									scale: 0,
								}}
								animate={{
									opacity: invite ? 1 : 0,
									marginTop: invite ? 16 : 0,
									marginBottom: invite ? 8 : 0,
									scale: invite ? 1 : 0,
								}}
							>
								{invite && (
									<>
										<Image
											className='rounded-md border-black border-2'
											src={invite.thumbnail}
											alt={invite.name}
											width={52}
											height={52}
										/>
										<div className='flex flex-col justify-between w-full text-xs'>
											<div className='flex flex-col w-full'>
												<h3 className='font-semibold w-full flex justify-between line-clamp-1 break-all'>
													{invite.name}
													<FiX
														size={14}
														className='cursor-pointer'
														onClick={() =>
															setInvite(null)
														}
													/>
												</h3>
												<h4 className='text-gray-600 line-clamp-1 break-all'>
													{invite.description}
												</h4>
											</div>
											<h4 className='text-gray-600'>
												{window.location.origin}/invite/
												{inviteCode}
											</h4>
										</div>
									</>
								)}
							</motion.div>
							<div className='w-full overflow-x-auto py-2'>
								<div className='flex gap-4 items-center w-max '>
									{files.map((file) => (
										<ImagePreview
											setFiles={setFiles}
											src={file.file}
											id={file.id}
											key={file.id}
										/>
									))}
								</div>
							</div>
							<div className='flex justify-between items-center'>
								<div className='flex gap-6 items-center'>
									<div className='icon-action'>
										<span
											onClick={() =>
												setInviteCreation(
													!isCreatingInvite
												)
											}
										>
											<FiLink size={12} className='' />
										</span>
										<GroupInvite
											visible={isCreatingInvite}
											setInvite={setInvite}
											setInviteCode={setInviteCode}
											setInviteCreation={
												setInviteCreation
											}
										/>
									</div>
									<div className='icon-action'>
										<input
											type='file'
											capture
											name='files'
											id='post-files-input'
											accept='image/*'
											multiple
											className='hidden'
											onChange={(e: any) => {
												e.preventDefault();
												let files: Blob[] = [];

												if (e.dataTransfer) {
													files =
														e.dataTransfer.files;
												} else if (e.target.files) {
													files = e.target.files;
												}

												if (files.length == 0) return;

												let allFiles: string[] = [];

												const reader = new FileReader();
												let currentFile = 0;
												reader.onload = () => {
													allFiles.push(
														reader.result as string
													);

													currentFile++;
													try {
														reader.readAsDataURL(
															files[currentFile]
														);
													} catch {
														setFiles((prev) => [
															...prev,
															...allFiles.map(
																(f) => ({
																	id: (
																		new Date().getTime() *
																		Math.random()
																	).toString(),
																	file: f,
																})
															),
														]);
													}
												};

												reader.readAsDataURL(files[0]);
											}}
										/>
										<span
											onClick={() => {
												document
													.getElementById(
														"post-files-input"
													)
													?.click();
											}}
										>
											<FiImage size={14} className='' />
										</span>
									</div>
									<div>
										<span
											className='icon-action disabled'
											onClick={() => {}}
										>
											<FiCamera size={14} className='' />
										</span>
									</div>
								</div>
								<button
									type='submit'
									disabled={postLoading}
									className='bg-black text-white px-2 border-2 border-black py-0.5 rounded-md text-xs hover:bg-white hover:text-black hover:font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed'
								>
									{postLoading ? "Enviando..." : "Enviar"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</motion.div>
			<div id='observer-target'></div>
		</>
	);
}
