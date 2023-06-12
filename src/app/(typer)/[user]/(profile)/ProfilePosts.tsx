"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { _Post } from "@/types/interfaces";
import { useEffect, useRef, useState } from "react";
import { pusherClient } from "@/services/pusher";
import { motion } from "framer-motion";
import Post from "@/components/Post/Post";
import { Session } from "next-auth";
import { getProfilePosts } from "./page";

interface Props {
	posts: _Post[];
	session: Session | null;
	profile: string;
}

export default function ProfilePosts({
	posts: _posts,
	session,
	profile,
}: Props) {
	const [newPosts, setNewPosts] = useState<_Post[]>([]);
	const [deletedPosts, setDeletedPosts] = useState<string[]>([]);
	const postsRef = useRef<HTMLDivElement>(null);

	const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
		["query"],
		async ({ pageParam = 1 }) => {
			const response = await getProfilePosts(pageParam, profile, session);
			return response;
		},
		{
			getNextPageParam: (_, pages) => {
				return pages.length + 1;
			},
			initialData: {
				pages: [_posts],
				pageParams: [1],
			},
		}
	);

	useEffect(() => {
		pusherClient.unsubscribe("explore");

		pusherClient
			.subscribe(`user__${profile}__post`)
			.bind("new-post", (data: any) => {
				setNewPosts((prev) => [data, ...prev]);
			})
			.bind("remove-post", (id: string) => {
				setNewPosts((prev) => prev.filter((post) => post.id !== id));
				setDeletedPosts((prev) => [id, ...prev]);
			});
	}, []);

	async function scrollHandler(e: any) {
		const element: HTMLElement = e.target;

		if (
			element.scrollTop + element.clientHeight >=
			element.scrollHeight - 1000
		) {
			fetchNextPage();
		}
	}

	return (
		<motion.div
			className='flex flex-col overflow-x-hidden h-full'
			ref={postsRef}
			onScroll={scrollHandler}
		>
			{newPosts.map((post) =>
				deletedPosts.includes(post.id) ? null : (
					<Post user={session?.user?.id} post={post} key={post.id} />
				)
			)}
			{data?.pages.map((page, i) => (
				<div className='flex flex-col' key={i}>
					{page.map((post) =>
						deletedPosts.includes(post.id) ? null : (
							<Post
								user={session?.user?.id}
								post={post}
								key={post.id}
							/>
						)
					)}
				</div>
			))}
			{data!.pages[0].length + newPosts.length > 0 ? (
				<div className='opacity-75 pt-8 px-4 text-center md:px-8 pb-20'>
					Não há mais nada por aqui &lt;/3
				</div>
			) : (
				<div className='opacity-75 pt-8 px-4 text-center md:px-8 pb-20'>
					Não tem nada aqui &lt;/3
				</div>
			)}
		</motion.div>
	);
}
