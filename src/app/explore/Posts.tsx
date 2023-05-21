"use client";

import Post from "@/components/Post/Post";
import { Post as _Post, User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

interface Props {
	user: string | undefined;
	posts: (_Post & {
		author: User;
		likedBy: {
			email: string;
		}[];
	})[];
}

export default async function Posts({ posts: _posts, user }: Props) {
	const postsRef = useRef<HTMLDivElement>(null);
	const [pages, setPages] = useState([_posts]);

	useEffect(() => {
		if (_posts) {
			let posts = [...pages];
			posts[0] = [..._posts];
			setPages(posts.filter((p) => p != null));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [_posts]);

	async function scrollHandler(e: any) {
		const element: HTMLElement = e.target;

		if (element.scrollTop + element.clientHeight >= element.scrollHeight) {
			const page = Math.round(pages.length) + 1;

			const newPosts: Props["posts"] = await (
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
			{pages.map((posts, i) =>
				posts.map((post) => (
					<Post
						author={post.author}
						user={user}
						post={post}
						likedBy={post.likedBy.map((user) => user.email)}
						key={post.id}
					/>
				))
			)}
		</div>
	);
}
