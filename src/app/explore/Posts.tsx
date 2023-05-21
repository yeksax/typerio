import Post from "@/components/Posts/Post";
import { prisma } from "@/services/prisma";

export default async function Posts() {
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
			createdAt: "desc",
		},
	});

	return (
		<>
			{posts.map((post) => (
				<Post
					user={post.author}
					post={post}
					likedBy={post.likedBy.map((user) => user.id)}
					key={post.id}
				/>
			))}
		</>
	);
}
