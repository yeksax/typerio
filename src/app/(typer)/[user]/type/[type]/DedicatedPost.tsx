"use client";

import { Linkify } from "@/components/Linkify";
import LoadingBar from "@/components/LoadingBar";
import Likes from "@/components/Post/Likes";
import LinkAttachment from "@/components/Post/LinkCard";
import Post, { iconClass, postButtonStyle } from "@/components/Post/Post";
import PostActions from "@/components/Post/PostActions";
import PostGrid from "@/components/Post/PostGrid";
import Replies from "@/components/Post/Replies";
import Reply from "@/components/Post/Reply";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { extractFirstUrl, removeAccents } from "@/utils/general/string";
import { useSession } from "next-auth/react";
import { Source_Code_Pro } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
	post: _Post;
}

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export default function DedicatedPost({ post }: Props) {
	const [replyCount, setReplyCount] = useState(post._count.replies);
	const { author } = post;
	const { data: session, status } = useSession();
	const [replies, setReplies] = useState(post.replies!);
	const threadRef = useRef<HTMLDivElement | null>(null);
	const mainPostRef = useRef<HTMLDivElement | null>(null);
	const postURL = useRef(extractFirstUrl(post.content));

	useEffect(() => {
		pusherClient.unsubscribe("post-" + post.id);
		pusherClient
			.subscribe("post-" + post.id)
			.bind("new-reply", (data: any) => {
				setReplyCount(replyCount + 1);
				setReplies((r) => [data, ...r]);
			});

		let y = threadRef.current?.getBoundingClientRect().height;
		document.getElementById("main-scroller")!.scrollTo({
			top: y,
			behavior: "smooth",
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<div className='flex flex-col' ref={threadRef}>
				{post.thread!.map(
					(reply, i) => (
						<Post
							key={reply.id}
							post={reply}
							user={session?.user?.id!}
							replyTop={i !== 0}
							replyBottom
							deleted={reply.deleted}
						/>
					)
					// <Post author={reply.author}/>
				)}
			</div>
			<div className='flex px-6 md:px-8 gap-4' ref={mainPostRef}>
				<div className='flex flex-col gap-1 relative'>
					<div
						className={`${
							post.repliedId ? "bg-black dark:bg-zinc-800" : ""
						} w-0.5 h-3 relative left-1/2`}
					></div>
					<Link href={`/${removeAccents(author.username)}`}>
						<Image
							src={author.avatar}
							width={64}
							height={64}
							className='w-9 h-9 aspect-square object-cover rounded-md border-2 border-black'
							alt='profile picture'
						/>
					</Link>
				</div>
				<div className='flex flex-col gap-0.5 flex-1 py-4'>
					<span className='flex items-center justify-between text-xs'>
						<Link
							href={`/${removeAccents(author.username)}`}
							className='flex-col'
						>
							<h3 className='text-sm font-medium'>
								{author.name}
							</h3>
							<h3 className='text-xs font-medium opacity-60'>
								{author.name}#{author.tag}
							</h3>
						</Link>
						<PostActions post={post} session={session}/>
					</span>

					<Linkify className="text-sm mt-0.5">{post.content}</Linkify>

					{post.attachments && <PostGrid files={post.attachments} />}
					{postURL.current && (
						<LinkAttachment url={postURL.current} />
					)}
				</div>
			</div>
			<div className='flex px-8 pb-3 justify-between border-b-2 border-y-black'>
				<Replies
					id={post.id}
					user={session?.user?.id!}
					value={replyCount}
					iconClass={iconClass}
					className={postButtonStyle}
					isReplying={false}
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
			<div className='px-8 pt-2 pb-3 border-b-2 border-y-black relative'>
				<Reply post={post} user={session?.user?.id!} />
				<LoadingBar listener={`${post.id}__reply`} position='bottom' />
			</div>
			<div
				className='flex flex-col'
				style={{
					paddingBottom: "100%",
				}}
			>
				{replies.map(
					(reply) => (
						<Post
							key={reply.id}
							post={reply}
							user={session?.user?.id!}
						/>
					)
					// <Post author={reply.author}/>
				)}
			</div>
		</>
	);
}
