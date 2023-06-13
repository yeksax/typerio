import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import Posts from "./Posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";

export default async function Page() {
	const session = await getServerSession(authOptions)	
	const posts = await getPosts(1);

	return <Posts _posts={posts} session={session}/>;
}
