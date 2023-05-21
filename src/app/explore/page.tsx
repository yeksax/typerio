import Post from "@/components/Posts/Post";
import { prisma } from "@/services/prisma";

export const metadata = {
	title: "Typexplore",
};

const postsPerPage = 10;

async function getPosts(page: number) {
	return await prisma.post.findMany({
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
		take: postsPerPage,
		skip: (page - 1) * postsPerPage,
	});
}

export default async function Page() {
	"use server";
	const posts = await getPosts(1);

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
