"use client";
import { _Post } from "@/types/interfaces";
import { Source_Code_Pro } from "next/font/google";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Likes from "./Likes";
import Replies from "./Replies";

import { pusherClient } from "@/services/pusher";
import { getElapsedTime } from "@/utils/client/readableTime";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ChatInvite from "../Invite";
import LoadingBar from "../LoadingBar";
import PostActions from "./PostActions";
import PostGrid from "./PostGrid";
import Reply from "./Reply";
import { User } from "@prisma/client";
import { Session } from "next-auth";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

interface PostProps {
	post: _Post;
	user: string | undefined;
	replyTop?: boolean;
	replyBottom?: boolean;
	deleted?: boolean;
	pinned?: boolean;
	session: Session | null;
	replyingTo?: User[];
}

export const iconClass = "w-4 aspect-square";
export const postButtonStyle = "flex gap-1.5 items-center";

export default function Post({
	post,
	user,
	replyBottom,
	replyTop,
	deleted,
	pinned,
	session,
	replyingTo,
}: PostProps) {
	const [readableTime, setReadableTime] = useState("Há uma cota");
	const [replyOpen, setReplyOpen] = useState(false);
	const [replyCount, setReplyCount] = useState(post._count.replies);

	const { status, data: _session } = useSession();

	if (!session) session = _session;

	const timer = useRef<NodeJS.Timer | null>(null);
	const { author } = post;
	post.likedBy.map((u) => u.id).includes(user!);

	const postedAt = new Date(post.createdAt).getTime();
	const now = new Date().getTime();

	const timeDifference = new Date(now - postedAt).getTime() / 1000;

	useEffect(() => {
		timer.current = setInterval(() => {
			setReadableTime(getElapsedTime(timeDifference));
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
	}, []);

	if (deleted)
		return (
			<div className='flex flex-col px-4 md:px-8'>
				<div className='w-9 relative'>
					<div
						className={`${
							replyTop ? "bg-black" : ""
						} w-0.5 h-1 md:h-3 relative left-1/2`}
					></div>
				</div>
				<div className='border-2 rounded-md text-xs border-black my-1 px-4 py-2 italic opacity-75'>
					Post deletado...
				</div>
				{replyBottom && (
					<div className='w-9 relative'>
						<div
							className='bg-black w-0.5 flex-1 relative left-1/2'
							style={{
								outline: "4px solid white",
								bottom: "-2px",
								paddingTop: "2px",
								boxSizing: "border-box",
							}}
						></div>
					</div>
				)}
			</div>
		);

	return (
		<div className='border-b-2 border-black px-4 md:px-8 flex gap-4 w-full relative'>
			<Link
				href={`/${removeAccents(author.username)}`}
				className='flex flex-col gap-1 relative'
			>
				<div
					className={`${
						replyTop ? "bg-black" : ""
					} w-0.5 h-1 md:h-3 relative left-1/2`}
				></div>
				<Image
					src={author.avatar}
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
				<span className='flex items-start gap-4 justify-between text-xs'>
					<Link
						href={`/${removeAccents(author.username)}`}
						className='flex flex-col'
					>
						<h3 className='text-sm font-medium line-clamp-1 break-all'>
							{author.name}
						</h3>
						<div className='flex'>
							<h3 className='text-xs font-medium line-clamp-1 break-all opacity-60'>
								{author.name}
							</h3>
							<span>#{author.tag}</span>
						</div>
					</Link>
					<div className='flex gap-2 items-center'>
						<h3 className='opacity-75 w-max'>{readableTime}</h3>
						<PostActions post={post} pinned={pinned} />
					</div>
				</span>

				<Link href={`/${author.username}/type/${post.id}`}>
					<pre
						className={`text-sm font-medium mt-0.5 break-words whitespace-pre-wrap`}
					>
						{post.content}
					</pre>
				</Link>

				{post.attachments && <PostGrid files={post.attachments} />}

				{post.invite && <ChatInvite invite={post.invite} />}

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
			<LoadingBar listener={`${post.id}__reply`} position={"bottom"} />
		</div>
	);
}
