import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import Posts from "./Posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { getPosts } from "@/utils/server/posts";

export default async function Page() {
	const session = await getServerSession(authOptions);
	const posts = await getPosts({ page: 1, session });

	return <Posts _posts={posts} session={session} />;
}
