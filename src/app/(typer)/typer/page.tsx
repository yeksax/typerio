import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import Posts from "./Posts";

export const metadata = {
	title: "Typexplore",
};

const postsPerPage = 20;

export default async function Page() {
	"use server";
	const posts = await prisma.post.findMany({
		where: {
			replied: null,
			deleted: false,
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
					likedBy: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: postsPerPage,
	});

	//@ts-ignore
	return <Posts _posts={posts} />;
}
