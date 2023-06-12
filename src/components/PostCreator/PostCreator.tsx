"use client";

import { pusherClient } from "@/services/pusher";
import { _Chat, _User } from "@/types/interfaces";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FiLink, FiX } from "react-icons/fi";
import LoadingBar from "../LoadingBar";
import GroupInvite from "./GroupInvite";
import CreatorInput from "./PostInput";
import { createPost } from "./actions";
import { motion } from "framer-motion";

interface Props {
	user: _User;
}

export default function PostCreator({ user }: Props) {
	const formRef = useRef<HTMLFormElement>();
	const [postLoading, setPostLoading] = useState<boolean>(false);
	const { data: session } = useSession();

	const [isCreatingInvite, setInviteCreation] = useState<boolean>(false);
	const [invite, setInvite] = useState<_Chat | null>(null);
	const [inviteCode, setInviteCode] = useState<string | null>(null);

	useEffect(() => {
		if (!session?.user) return;
		pusherClient.unsubscribe(`${session.user.id}__post-loading`);
		pusherClient
			.subscribe(`${session.user.id}__post-loading`)
			.bind("progress", (progress: number) => {
				setPostLoading(progress !== 0);
			});
	}, [session?.user]);

	return (
		<div className='flex flex-col relative'>
			<LoadingBar listener='post-loading' position='top' />
			<form
				className='border-b-2 border-black px-4 py-1.5 md:px-8 md:py-4 flex gap-4 w-full relative'
				// @ts-ignore
				ref={formRef}
				action={async (e) => {
					await createPost(e, user.id);
					formRef.current!.reset();
				}}
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
												onClick={() => setInvite(null)}
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
					<div className='flex justify-between items-center'>
						<div className='flex gap-2 items-center'>
							<div className=''>
								<div
									className='icon-action'
									onClick={() =>
										setInviteCreation(!isCreatingInvite)
									}
								>
									<FiLink size={12} className='' />
								</div>
								<GroupInvite
									visible={isCreatingInvite}
									setInvite={setInvite}
									setInviteCode={setInviteCode}
									setInviteCreation={setInviteCreation}
								/>
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
	);
}
