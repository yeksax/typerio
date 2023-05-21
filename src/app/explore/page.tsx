import Post from "@/components/Post/Post";
import { prisma } from "@/services/prisma";
import Posts from "./Posts";

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
		take: 10,
	});
}

export default async function Page() {
	"use server";
	const posts = await getPosts(1);

	//@ts-expect-error
	return <Posts posts={posts} />;
}
