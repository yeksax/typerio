"use client";
import { _Post } from "@/types/interfaces";
import { Source_Code_Pro } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Likes from "./Likes";
import Replies from "./Replies";

import { pusherClient } from "@/services/pusher";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PostLoading from "../PostLoading";
import Reply from "./Reply";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import PostActions from "./PostActions";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

interface PostProps {
	post: _Post;
	user: string | undefined;
	replyTop?: boolean;
	replyBottom?: boolean;
}

export const iconClass = "w-4 aspect-square";
export const postButtonStyle = "flex gap-1.5 items-center";

function getReadableTime(time: number) {
	let timeString = "Há uma cota";

	if (time <= 60 * 60 * 24 * 30)
		timeString = `${Math.floor(time / 60 / 60 / 24)}d`;
	if (time <= 60 * 60 * 24) timeString = `${Math.floor(time / 60 / 60)}h`;
	if (time <= 60 * 60) timeString = `${Math.floor(time / 60)}m`;
	if (time < 60) timeString = `${Math.floor(time)}s`;

	return timeString != "Há uma cota" ? `${timeString} atrás` : "Há uma cota";
}

export default function Post({ post, user, replyBottom, replyTop }: PostProps) {
	const [readableTime, setReadableTime] = useState("Há uma cota");
	const [replyOpen, setReplyOpen] = useState(false);
	const [replyCount, setReplyCount] = useState(post._count.replies);

	const { data: session, status } = useSession();

	const timer = useRef<NodeJS.Timer | null>(null);
	const { author } = post;
	post.likedBy.map((u) => u.id).includes(user!);
	const isAuthor = author.id === user;

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
		<div className='border-b-2 border-black px-4 md:px-8 flex gap-4 w-full relative'>
			<Link
				href={`/${author.username}`}
				className='flex flex-col gap-1 relative'
			>
				<div className={`${replyTop ? 'bg-black' : ""} w-0.5 h-1 md:h-3 relative left-1/2`}></div>
				<Image
					src={author.profilePicture}
					width={50}
					height={50}
					className='ceiled-md w-9 h-9 aspect-square object-cover rounded-md border-2 border-black'
					alt='profile picture'
				/>
				{replyBottom && (
					<div
						className='bg-black w-0.5 flex-1 relative left-1/2'
						style={{
							outline: "4px solid white",
							bottom: "-2px",
							paddingTop: "2px",
							boxSizing: "border-box",
						}}
					></div>
				)}
			</Link>
			<div className='flex flex-col gap-0.5 flex-1 py-1.5 md:py-4'>
				<span className='flex items-center justify-between text-xs'>
					<Link
						href={`/${author.username}`}
						className='flex flex-col'
					>
						<h3 className='text-sm font-medium'>{author.name}</h3>
						<h3 className='text-xs font-medium opacity-60'>
							{author.name}#{author.tag}
						</h3>
					</Link>
					<div className='flex gap-2 items-center'>
						<h3 className='opacity-75'>{readableTime}</h3>
						<PostActions post={post} />
					</div>
				</span>

				<Link
					prefetch={false}
					href={`/${author.username}/type/${post.id}`}
				>
					<pre
						className={`${sourceCodePro.className} text-sm font-medium mt-0.5 break-words whitespace-pre-wrap`}
					>
						{post.content}
					</pre>
				</Link>

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
					{status === "authenticated" ? (
						<Likes
							id={post.id}
							user={session?.user?.id!}
							isLiked={post.likedBy
								.map((user) => user.id)
								.includes(session?.user?.id!)}
							value={post.likedBy.length}
							iconClass={iconClass}
							className={postButtonStyle}
						/>
					) : (
						<Likes
							key={"loading"}
							id={post.id}
							user={"loading"}
							isLiked={false}
							value={post.likedBy.length}
							iconClass={iconClass}
							className={postButtonStyle}
						/>
					)}
				</div>

				<motion.div
					className='overflow-hidden'
					initial={{
						height: 0,
						opacity: 0,
					}}
					animate={{
						height: replyOpen ? "auto" : "0",
						opacity: replyOpen ? 1 : 0,
					}}
				>
					<Reply post={post} user={user!} focus={replyOpen} />
				</motion.div>
			</div>
			<PostLoading listener={`${post.id}__reply`} position={"bottom"} />
		</div>
	);
}
