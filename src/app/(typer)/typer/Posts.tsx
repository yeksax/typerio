"use client";

import { creatorFloat } from "@/atoms/creatorAtom";
import Post from "@/components/Post/Post";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { POSTS_PER_PAGE } from "@/utils/general/usefulConstants";
import { getPosts } from "@/utils/server/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { Session } from "next-auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";

interface Props {
	_posts: _Post[];
	session: Session | null;
}

export default function Posts({ _posts, session }: Props) {
	const [newPosts, setNewPosts] = useState<_Post[]>([]);
	const [deletedPosts, setDeletedPosts] = useState<string[]>([]);

	const postsRef = useRef<HTMLDivElement>(null);
	const user = session?.user?.id;

	const { data, fetchNextPage, isFetching } = useInfiniteQuery(
		["query"],
		async ({ pageParam = 1 }) => {
			const response = await getPosts({
				page: pageParam,
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
			.subscribe("explore")
			.bind("new-post", (data: any) => {
				setNewPosts((prev) => [data, ...prev]);
			})
			.bind("remove-post", (id: string) => {
				setNewPosts((prev) => prev.filter((post) => post.id !== id));
				setDeletedPosts((prev) => [id, ...prev]);
			});

		document
			.getElementById("main-scroller")
			?.addEventListener("scroll", scrollHandler);

		return () => {
			pusherClient.unsubscribe("explore");
			document
				.getElementById("main-scroller")
				?.removeEventListener("scroll", scrollHandler);
		};
	}, [scrollHandler]);

	return (
		<motion.div className='h-full' ref={postsRef}>
			{session && <CreatorOpener />}
			{newPosts.map((post) =>
				deletedPosts.includes(post.id) ? null : (
					<Post
						user={user}
						session={session}
						post={post}
						key={post.id}
					/>
				)
			)}
			{data?.pages.map((page, i) => (
				<div className='flex flex-col' key={i}>
					{page.map((post) =>
						deletedPosts.includes(post.id) ? null : (
							<Post
								user={user}
								session={session}
								post={post}
								key={post.id}
							/>
						)
					)}
				</div>
			))}
			{data!.pages[0].length + newPosts.length > 0 ? (
				<div
					className='opacity-75 pt-8 px-4 text-center md:px-8 pb-20'
					onClick={async () => await fetchNextPage()}
				>
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

function CreatorOpener() {
	const setCreatorFloatingState = useSetAtom(creatorFloat);
	
	return (
		<motion.div
			onClick={() => setCreatorFloatingState((prev) => !prev)}
			drag
			dragSnapToOrigin
			className='fixed cursor-pointer md:hidden z-30 rounded-md p-2 right-8 bottom-[4.5rem] bg-white border-black dark:bg-zinc-900 border-2 border-r-4 border-b-4 dark:border-zinc-950'
		>
			<FiEdit size={14} />
		</motion.div>
	);
}
