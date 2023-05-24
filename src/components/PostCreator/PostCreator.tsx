"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { useRef, useTransition } from "react";
import CreatorInput from "./PostInput";
import PostLoading from "../PostLoading";
import Submit from "./PostSubmit";
import { createPost } from "./actions";

export default function PostCreator({ user }: { user: User }) {
	const [isPending, startTransition] = useTransition();
	const formRef = useRef<HTMLFormElement>()

	return (
		<div className='flex flex-col relative'>
			<PostLoading listener="post-loading" position="top"/>
			<form
				className='border-b-2 border-black px-4 py-1.5 md:px-8 md:py-4  flex gap-4 w-full relative'
				// @ts-ignore
				ref={formRef}
				action={async (e) => {
					await createPost(e, user.id);
					formRef.current?.reset()
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
					<CreatorInput user={user} />
					<div className='flex justify-between'>
						<div className='flex gap-2'></div>
						<Submit />
					</div>
				</div>
			</form>
		</div>
	);
}
