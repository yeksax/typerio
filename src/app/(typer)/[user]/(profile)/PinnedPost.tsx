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

	return pinnedPost ? (
		<div className='flex flex-col pt-2'>
			<div className='text-xs opacity-80 px-4 md:px-8 flex gap-4 -mb-1.5'>
				<TbPinned />
				Post fixado
			</div>
			<Post
				post={pinnedPost}
				user={session?.user!.id}
				key={pinnedPost.id}
			/>
		</div>
	) : (
		<></>
	);
}
