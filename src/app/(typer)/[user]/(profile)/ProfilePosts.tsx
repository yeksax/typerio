"use client";

import Post from "@/components/Post/Post";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { POSTS_PER_PAGE } from "@/utils/general/usefulConstants";
import { getPosts } from "@/utils/server/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import { useCallback, useEffect, useRef, useState } from "react";

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
	const [currentPinned, setCurrentPinned] = useState(
		_posts[0]?.author.pinnedPostId
	);
	const postsRef = useRef<HTMLDivElement>(null);

	const { data, fetchNextPage, isFetching } = useInfiniteQuery(
		["query"],
		async ({ pageParam = 1 }) => {
			const response = await getPosts({
				page: pageParam,
				owner: profile,
				session: session,
			});
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

	const scrollHandler = useCallback(
		async (e: any) => {
			const element: HTMLElement = e.target;

			const hasLoadedEverything =
				data!.pages.at(-1)!.length < POSTS_PER_PAGE;

			const isCloseToEnd =
				element.scrollTop + element.clientHeight >=
				element.scrollHeight - 1000;

			if (isCloseToEnd && !isFetching && !hasLoadedEverything) {
				await fetchNextPage();
			}
		},
		[fetchNextPage, isFetching]
	);

	useEffect(() => {
		pusherClient
			.subscribe(`user__${profile}__post`)
			.bind("new-post", (data: any) => {
				setNewPosts((prev) => [data, ...prev]);
			})
			.bind("remove-post", (id: string) => {
				setNewPosts((prev) => prev.filter((post) => post.id !== id));
				setDeletedPosts((prev) => [id, ...prev]);
			});

		const channel = `user__${profile}__pinned`;

		pusherClient
			.subscribe(channel)
			.bind("pin", (data: _Post) => {
				setCurrentPinned(data.id);
			})
			.bind("unpin", () => {
				setCurrentPinned(null);
			});

		document
			.getElementById("main-scroller")
			?.addEventListener("scroll", scrollHandler);

		return () => {
			pusherClient.unsubscribe(channel);
			pusherClient.unsubscribe(`user__${profile}__post`);
			document
				.getElementById("main-scroller")
				?.removeEventListener("scroll", scrollHandler);
		};
	}, [scrollHandler]);

	return (
		<motion.div
			className='overflow-x-hidden h-full'
			ref={postsRef}
			onScroll={scrollHandler}
		>
			{newPosts.map((post) =>
				deletedPosts.includes(post.id) ? null : (
					<Post
						session={session}
						user={session?.user?.id}
						post={post}
						key={post.id}
					/>
				)
			)}
			{data?.pages.map((page, i) => (
				<div className='flex flex-col' key={i}>
					{page.map((post) =>
						deletedPosts.includes(post.id) ||
						currentPinned === post.id ? null : (
							<Post
								session={session}
								user={session?.user?.id}
								post={post}
								key={post.id}
							/>
						)
					)}
				</div>
			))}
			{data!.pages[0].length + newPosts.length > 0 ? (
				<div className='opacity-75 pt-8 px-4 md:px-8 text-center pb-20'>
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
