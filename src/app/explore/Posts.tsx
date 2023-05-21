"use client";

import Post from "@/components/Post/Post";
import { Post as _Post, User } from "@prisma/client";
import { useRef } from "react";

interface Props {
  user: string | undefined
	posts: (_Post & {
		author: User;
		likedBy: {
			email: string;
		}[];
	})[];
}

export default async function Posts({ posts, user }: Props) {
	const postsRef = useRef<HTMLDivElement>(null);

	function scrollHandler(e: any) {
		const element: HTMLElement = e.target;
		if (
			element.scrollTop + element.clientHeight >=
			element.scrollHeight - 100
		) {
			console.log("bottom");
		}
	}

	return (
		<div
			className='flex flex-col overflow-y-scroll h-full typer-scroll border-scroll'
			ref={postsRef}
			onScroll={scrollHandler}
		>
			{posts.map((post) => (
				<Post
					author={post.author}
          user={user}
					post={post}
					likedBy={post.likedBy.map((user) => user.email)}
					key={post.id}
				/>
			))}
		</div>
	);
}
