import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import { Post } from "@prisma/client";
import { getServerSession } from "next-auth";
import Image from "next/image";
import CreatorInput from "./PostInput";
import PostLoading from "./PostLoading";
import Submit from "./PostSubmit";

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

		async function updatePercent(percent: number) {
			let session = await getServerSession();

			await fetch(
				process.env.PAGE_URL! + "/api/pusher/updatePostStatus",
				{
					method: "POST",
					body: JSON.stringify({
						percent: percent,
						channel: `${session?.user?.email}__post-loading`,
					}),
					cache: "no-store",
				}
			);
		}

		if (data.get("content")!.length == 0) return;
		await updatePercent(10);

		const post = await prisma.post.create({
			data: {
				content: data.get("content")?.toString().trim() as string,
				author: {
					connect: {
						id: user?.id,
					},
				},
			},
			include: {
				author: true,
				likedBy: {
					select: {
						email: true,
					},
				},
			},
		});

		await updatePercent(50);

		fetch(process.env.PAGE_URL! + "/api/pusher/newPost", {
			method: "POST",
			body: JSON.stringify({
				post,
			}),
			cache: "no-store",
		});

		await updatePercent(100);

		pusherClient
			.subscribe("explore")
			.bind("new-post", async (newPost: any) => {
				console.log(newPost.id, post.id);

				pusherClient.unsubscribe("explore");
				if (newPost.id == post.id) {
					await updatePercent(0);
				}
			});

		await updatePercent(0);
	}

	return (
		<div className='flex flex-col'>
			<PostLoading />
			<form
				className='border-b-2 border-black px-16 py-4 flex gap-4 w-full relative'
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
						<Submit />
					</div>
				</div>
			</form>
		</div>
	);
}
