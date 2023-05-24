import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import Posts from "./Posts";

export const metadata = {
	title: "Typexplore",
};

const postsPerPage = 20;

async function getPosts(): Promise<_Post[]> {
	return await prisma.post.findMany({
		where: {
			replied: null,
		},
		include: {
			author: true,
			likedBy: {
				select: {
					id: true,
				},
			},
			_count: {
				select: {
					replies: true,
					likedBy: true
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: postsPerPage,
	});
}

export default async function Page() {
	"use server";
	const posts = await getPosts();

	//@ts-ignore
	return <Posts _posts={posts} />;
}
