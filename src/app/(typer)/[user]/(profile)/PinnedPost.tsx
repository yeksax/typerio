"use client";

import Post from "@/components/Post/Post";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { TbPinned } from "react-icons/tb";

interface Props {
	post: _Post | null;
	session: Session | null;
	user: string;
}

export default function PinnedPost({ post, session, user }: Props) {
	const [pinnedPost, setPinnedPost] = useState(post);

	useEffect(() => {
		const channel = `user__${user}__pinned`;

		pusherClient
			.subscribe(channel)
			.bind("pin", (data: _Post) => {
				setPinnedPost(data);
			})
			.bind("unpin", () => {
				setPinnedPost(null);
			});

		return () => {
			pusherClient.unsubscribe(channel);
		};
	}, []);

	return pinnedPost ? (
		<div className='flex flex-col pt-2'>
			<div className='text-xs text-gray-600 px-4 md:px-8 flex gap-4 -mb-1.5'>
				<TbPinned />
				Post fixado
			</div>
			<Post post={pinnedPost} user={session?.user!.id} pinned />
		</div>
	) : (
		<></>
	);
}
