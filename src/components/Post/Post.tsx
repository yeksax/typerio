"use client";
import { _Post } from "@/types/interfaces";
import { User } from "@prisma/client";
import { Source_Code_Pro } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Likes from "./Likes";
import Replies from "./Replies";

import { motion } from "framer-motion";
import PostCreator from "@/app/explore/PostCreator/PostCreator";
import Reply from "./Reply";
import PostLoading from "../PostLoading";
import { pusherClient } from "@/services/pusher";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

interface PostProps {
	post: _Post;
	author: User;
	user: string | undefined;
	likedBy: string[];
	replies: any;
}

function getReadableTime(time: number) {
	let timeString = "Há uma cota";

	if (time <= 60 * 60 * 24 * 30)
		timeString = `${Math.floor(time / 60 / 60 / 24)}d`;
	if (time <= 60 * 60 * 24) timeString = `${Math.floor(time / 60 / 60)}h`;
	if (time <= 60 * 60) timeString = `${Math.floor(time / 60)}m`;
	if (time < 60) timeString = `${Math.floor(time)}s`;

	return timeString != "Há uma cota" ? `${timeString} atrás` : "Há uma cota";
}

export default function Post({
	post,
	author,
	user,
	likedBy,
	replies,
}: PostProps) {
	const [readableTime, setReadableTime] = useState("Há uma cota");
	const timer = useRef<NodeJS.Timer | null>(null);
	const isLiked = likedBy.includes(user!);
	const iconClass = "w-4 aspect-square";
	const postButtonStyle = "flex gap-1.5 items-center";
	const [replyOpen, setReplyOpen] = useState(false);
	const [replyCount, setReplyCount] = useState(post._count.replies);

	const postedAt = new Date(post.createdAt).getTime();
	const now = new Date().getTime();

	const timeDifference = new Date(now - postedAt).getTime() / 1000;

	useEffect(() => {
		timer.current = setInterval(() => {
			setReadableTime(getReadableTime(timeDifference));
		}, 1000);
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, [timeDifference]);

	useEffect(() => {
		pusherClient.unsubscribe("post-" + post.id);
		pusherClient.subscribe("post-" + post.id).bind("new-reply", () => {
			setReplyCount(replyCount + 1);
		});
	});

	return (
		<div className='border-b-2 border-black px-8 py-4 flex gap-4 w-full relative'>
			<Image
				src={author.profilePicture}
				width={50}
				height={50}
				className='ceiled-md w-9 h-9 aspect-square object-cover'
				alt='profile picture'
			/>
			<div className='flex flex-col gap-0.5 flex-1'>
				<span className='flex items-center justify-between text-xs'>
					<span className='flex-col'>
						<h3 className='text-sm font-medium'>{author.name}</h3>
						<h3 className='text-xs font-medium opacity-60'>
							{author.name}#{author.tag}
						</h3>
					</span>
					<h3 className='opacity-75'>{readableTime}</h3>
				</span>

				<pre
					className={`${sourceCodePro.className} text-sm font-medium mt-0.5 break-all whitespace-pre-wrap`}
				>
					{post.content}
				</pre>

				<div className='flex justify-between text-sm font-medium items-center h-6 mt-2'>
					<Replies
						id={post.id}
						user={user!}
						value={replyCount}
						iconClass={iconClass}
						className={postButtonStyle}
						setReplyOpen={setReplyOpen}
						isReplying={replyOpen}
					/>
					<Likes
						id={post.id}
						user={user!}
						isLiked={isLiked}
						value={likedBy.length}
						iconClass={iconClass}
						className={postButtonStyle}
					/>
				</div>

				<motion.div
					className='overflow-hidden'
					initial={{
						height: 0,
					}}
					animate={{
						height: replyOpen ? "auto" : "0",
					}}
				>
					<Reply post={post} user={user!} focus={replyOpen}/>
				</motion.div>
			</div>
			<PostLoading listener={`${post.id}__reply`} position={"bottom"} />
		</div>
	);
}
