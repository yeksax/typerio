"use client";
import { _Post } from "@/types/interfaces";
import { Source_Code_Pro } from "next/font/google";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import Likes from "./Likes";
import Replies from "./Replies";

import { pusherClient } from "@/services/pusher";
import { getElapsedTime } from "@/utils/client/readableTime";
import { extractFirstUrl, removeAccents } from "@/utils/general/string";
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
import { likedPostsAtom } from "@/atoms/appState";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { Linkify } from "../Linkify";
import LinkAttachment from "./LinkCard";
import ElapsedTime from "./ElapsedTime";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

interface PostProps {
	post: _Post;
	user: string | undefined;
	replyTop?: boolean;
	replyBottom?: boolean;
	deleted?: boolean;
	session?: Session | null;
	replyingTo?: User[];
	taggedAs?: ReactNode;
}

export const iconClass = "w-4 aspect-square";
export const postButtonStyle = "flex gap-1.5 items-center";

export default function Post({
	post,
	user,
	replyBottom,
	replyTop,
	deleted,
	session,
	taggedAs,
	replyingTo,
}: PostProps) {
	const [replyOpen, setReplyOpen] = useState(false);
	const [replyCount, setReplyCount] = useState(post._count.replies);
	const [isDeleted, setIsDeleted] = useState(false);
	const router = useRouter();

	const { status, data: _session } = useSession();

	if (!session) session = _session;

	const postURL = useRef(extractFirstUrl(post.content));
	const { author } = post;
	post.likedBy.map((u) => u.id).includes(user!);

	const postedAt = new Date(post.createdAt).getTime();
	const now = new Date().getTime();

	const timeDifference = new Date(now - postedAt).getTime() / 1000;

	useEffect(() => {
		pusherClient.subscribe(`post__${post.id}`).bind("deleted-post", () => {
			setIsDeleted(true);
		});

		return () => {
			pusherClient.unsubscribe(`post__${post.id}`);
		};
	}, []);

	useEffect(() => {
		pusherClient.unsubscribe("post-" + post.id);
		pusherClient.subscribe("post-" + post.id).bind("new-reply", () => {
			setReplyCount(replyCount + 1);
		});
	}, []);

	if (deleted || isDeleted)
		return (
			<div className='flex flex-col px-4 md:px-8 font-normal'>
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
							className='bg-black dark:bg-zinc-800 w-0.5 flex-1 outline-none outline-offset-0 outline-4 outline-white dark:outline-zinc-900 relative left-1/2'
							style={{
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
		<div
			onPointerUp={(e) => {
				let el = e.target as HTMLElement;

				if (
					window.getSelection()?.toString() === "" &&
					(el.tagName == "DIV" || el.tagName == "PRE")
				)
					router.push(`/${author.username}/type/${post.id}`);
			}}
			className='border-b-2 group post dark:hover:bg-zinc-850 transition-colors cursor-pointer dark:border-zinc-950 border-black px-6 md:px-8 flex flex-col relative'
		>
			{taggedAs}
			<div className='flex gap-4 w-full'>
				<div className='flex flex-col gap-1 relative'>
					<div
						className={`${
							replyTop ? "bg-black dark:bg-zinc-800" : ""
						} w-0.5 h-1.5 md:h-3.5 relative left-1/2`}
					></div>
					<Link href={`/${removeAccents(author.username)}`}>
						<Image
							src={author.avatar}
							width={64}
							height={64}
							className='ceiled-md w-9 h-9 aspect-square object-cover rounded-md border-2 border-black dark:border-zinc-950'
							alt='profile picture'
						/>
					</Link>
					{replyBottom && (
						<div
							className='bg-black dark:bg-zinc-800 w-0.5 flex-1 relative outline-none outline-offset-0 outline-4 outline-white dark:outline-zinc-900 left-1/2'
							style={{
								bottom: "-2px",
								paddingTop: "2px",
								boxSizing: "border-box",
							}}
						></div>
					)}
				</div>
				<div className='flex flex-col gap-0.5 flex-1 py-2 md:py-4'>
					<span className='flex items-start gap-4 justify-between text-xs'>
						<Link
							href={`/${removeAccents(author.username)}`}
							className='flex flex-col'
						>
							<h3 className='text-sm font-medium line-clamp-1 break-all'>
								{author.displayName || author.name}
							</h3>
							<div className='flex'>
								<h3 className='text-xs font-medium line-clamp-1 break-all opacity-60'>
									{author.name}
								</h3>
								<span>#{author.tag}</span>
							</div>
						</Link>
						<div className='flex gap-2 items-center'>
							<ElapsedTime time={post.updatedAt} />
							<PostActions post={post} session={session}/>
						</div>
					</span>

					<Linkify>{post.content}</Linkify>

					{post.attachments && <PostGrid key={post.id} files={post.attachments} />}

					{post.invite && <ChatInvite invite={post.invite} />}

					{postURL.current && (
						<LinkAttachment url={postURL.current} />
					)}

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
			</div>
			<LoadingBar listener={`${post.id}__reply`} position={"bottom"} />
		</div>
	);
}
