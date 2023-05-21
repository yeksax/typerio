import { prisma } from "@/services/prisma";
import { Post } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";
import CreatorInput from "./PostInput";

interface Props {
	setPosts: (posts: Post[]) => void;
}

export default async function PostCreator({ setPosts }: Props) {
	const session = await getServerSession();

	if (!session) return <></>;

	const user = await prisma.user.findUnique({
		where: {
			email: session?.user?.email as string,
		},
	});

	if (!user) return <></>;

	async function createPost(data: FormData) {
		"use server";

		if (data.get("content")!.length == 0) return;

		await prisma.post.create({
			data: {
				content: data.get("content")?.toString().trim() as string,
				author: {
					connect: {
						id: user?.id,
					},
				},
			},
		});
	}

	return (
		<form
			className='border-b-2 border-black px-16 py-4 flex gap-4 w-full'
			action={createPost}
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
					<button
						type='submit'
						className='bg-black text-white px-2 border-2 border-black py-1 rounded-md text-xs hover:bg-white hover:text-black hover:font-bold transition-all'
					>
						Enviar
					</button>
				</div>
			</div>
		</form>
	);
}
