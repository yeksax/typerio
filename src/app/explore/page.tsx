import Post from "@/components/Post/Post";
import { prisma } from "@/services/prisma";
import Posts from "./Posts";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";

export const metadata = {
	title: "Typexplore",
};

const postsPerPage = 20;

async function getPosts(page: number) {
	return await prisma.post.findMany({
		include: {
			author: true,
			likedBy: {
				select: {
					email: true,
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
	const session = await getServerSession()
	const posts = await getPosts(0);

	//@ts-expect-error
	return <Posts posts={posts} user={session?.user?.email}/>;
}
