"use client";

import Post from "@/components/Post/Post";
import PostSkeleton from "@/components/Post/Skeleton";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface Props {
	_posts: _Post[];
}

export default async function Posts({ _posts }: Props) {
	const postsRef = useRef<HTMLDivElement>(null);
	const [pages, setPages] = useState([_posts]);

	const { data: session, status } = useSession();
	const user = session?.user?.id;

	useEffect(() => {
		pusherClient.unsubscribe("explore");

		pusherClient.subscribe("explore").bind("new-post", (data: any) => {
			let tmp_posts = [...pages];
			tmp_posts[0] = [data, ...tmp_posts[0]];
			setPages([...tmp_posts]);
		});
	}, [pages]);

	useEffect(() => {
		if (_posts) {
			let posts = [...pages];
			posts[0] = [..._posts];
			setPages(posts.filter((p) => !!p));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [_posts]);

	async function scrollHandler(e: any) {
		const element: HTMLElement = e.target;

		if (element.scrollTop + element.clientHeight >= element.scrollHeight) {
			const page = Math.round(pages.length) + 1;

			const newPosts: _Post[] = await (
				await fetch(`/api/posts?page=${page}`)
			).json();

			if (newPosts.length > 0) {
				let posts = [...pages];
				posts[page] = newPosts;
				setPages(posts);
			}
		}
	}

	return (
		<div
			className='flex flex-col overflow-y-scroll h-full typer-scroll border-scroll'
			ref={postsRef}
			onScroll={scrollHandler}
		>
			{status === "loading" ? (
				<>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</>
			) : (
				pages.map((posts, i) =>
					posts.map((post) => (
						<Post user={user} post={post} key={post.id} />
					))
				)
			)}
		</div>
	);
}
