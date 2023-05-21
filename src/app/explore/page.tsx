import Post from "@/components/Post/Post";
import { prisma } from "@/services/prisma";
import Posts from "./Posts";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";

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
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export default async function Page() {
	"use server";
	const posts = await getPosts(0);
	const session = await getServerSession()

	//@ts-expect-error
	return <Posts posts={posts} user={session?.user?.email}/>;
}
