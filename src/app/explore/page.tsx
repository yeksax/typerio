import { prisma } from "@/services/prisma";
import PostCreator from "./PostCreator/PostCreator";
import Post from "@/components/Posts/Post";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";

export const metadata = {
	title: "Typexplore",
};

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function Page() {
	"use server";
	const posts = await prisma.post.findMany({
		include: {
			author: true,
			likedBy: {
				select: {
					id: true,
				},
			},
		},
    orderBy: {
      createdAt: 'desc'
    }
	});

	return (
		<div className='flex flex-col'>
			{posts.map((post) => (
				<Post
					user={post.author}
					post={post}
					likedBy={post.likedBy.map((user) => user.id)}
					key={post.id}
				/>
			))}
		</div>
	);
}
