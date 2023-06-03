import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import Posts from "./Posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "./actions";

export default async function Page() {
	"use server";
	
	const posts = await getPosts(1);

	return <Posts _posts={posts}/>;
}
