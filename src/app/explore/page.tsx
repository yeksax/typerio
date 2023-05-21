import Post from "@/components/Posts/Post";
import { prisma } from "@/services/prisma";

export const metadata = {
	title: "Typexplore",
};

export default async function ExplorePage() {
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
