"use client";

import Post from "@/components/Post/Post";
import { supabase } from "@/services/supabase";
import { Post as _Post, User } from "@prisma/client";
import { useRef, useState } from "react";

interface Props {
	posts: (_Post & {
		author: User;
		likedBy: {
			id: string;
		}[];
	})[];
}

export default async function Posts({ posts }: Props) {
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
					user={post.author}
					post={post}
					likedBy={post.likedBy.map((user) => user.id)}
					key={post.id}
				/>
			))}
		</div>
	);
}
