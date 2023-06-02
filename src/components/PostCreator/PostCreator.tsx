"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LoadingBar from "../LoadingBar";
import CreatorInput from "./PostInput";
import { createPost } from "./actions";
import { pusherClient } from "@/services/pusher";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { _User } from "@/types/interfaces";

interface Props {
	user: _User;
}

export default function PostCreator({ user }: Props) {
	const formRef = useRef<HTMLFormElement>();
	const [postLoading, setPostLoading] = useState<boolean>(false);
	const [pretyped, setPretyped] = useState("");
	const { data: session } = useSession();

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
				className='border-b-2 border-black px-4 py-1.5 md:px-8 md:py-4  flex gap-4 w-full relative'
				// @ts-ignore
				ref={formRef}
				action={async (e) => {
					await createPost(e, user.id);
					formRef.current!.reset();
				}}
			>
				<Image
					src={user?.profilePicture}
					width={50}
					height={50}
					className='rounded-md w-9 h-9 aspect-square object-cover border-2 border-black'
					alt='profile picture'
				/>
				<div className='flex flex-col gap-2 w-full'>
					<div className='flex flex-col justify-between'>
						<h3 className='text-sm opacity-90'>
							Postando como {user.name}
						</h3>
						<h4 className='text-xs opacity-75'>
							{user.name}#{user.tag}
						</h4>
					</div>
					<CreatorInput user={user} pretyped={pretyped} />
					<div className='flex justify-between'>
						<div className='flex gap-2'></div>
						<button
							type='submit'
							disabled={postLoading}
							className='bg-black text-white px-2 border-2 border-black py-1 rounded-md text-xs hover:bg-white hover:text-black hover:font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed'
						>
							{postLoading ? "Enviando..." : "Enviar"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
