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
		const channelName = `user__${user}__pinned`;

		let channel = pusherClient.channel(channelName);

		if (!channel) channel = pusherClient.subscribe(channelName);

		const pin = (data: _Post) => {
			setPinnedPost(data);
		};

		const unpin = () => {
			setPinnedPost(null);
		};

		channel.bind("pin", pin).bind("unpin", unpin);

		return () => {
			channel.unbind("pin", pin).unbind("unpin", unpin);
		};
	}, []);

	const pinned = (
		<div className='text-xs opacity-80 relative top-2 flex gap-4'>
			<TbPinned />
			Post fixado
		</div>
	);

	return pinnedPost ? (
		<>
			<Post
				post={pinnedPost}
				user={session?.user!.id}
				key={pinnedPost.id}
				taggedAs={pinned}
			/>
		</>
	) : (
		<></>
	);
}
