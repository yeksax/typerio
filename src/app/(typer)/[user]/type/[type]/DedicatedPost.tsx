"use client";

import Likes from "@/components/Post/Likes";
import Post, { iconClass, postButtonStyle } from "@/components/Post/Post";
import PostActions from "@/components/Post/PostActions";
import Replies from "@/components/Post/Replies";
import Reply from "@/components/Post/Reply";
import PostLoading from "@/components/PostLoading";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
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
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		pusherClient.unsubscribe("post-" + post.id);
		pusherClient
			.subscribe("post-" + post.id)
			.bind("new-reply", (data: any) => {
				setReplyCount(replyCount + 1);
				setReplies((r) => [data, ...r]);
			});

		let y = threadRef.current?.getBoundingClientRect().height;
		containerRef.current?.scrollTo({
			top: y,
			behavior: "smooth",
		});
		
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className='overflow-y-scroll typer-scroll border-scroll h-full'
			ref={containerRef}
		>
			<div className='flex flex-col' ref={threadRef}>
				{post.thread!.map(
					(reply, i) => (
						<Post
							key={reply.id}
							post={reply}
							user={session?.user?.id!}
							replyTop={i !== 0}
							replyBottom
						/>
					)
					// <Post author={reply.author}/>
				)}
			</div>
			<div className='flex px-4 md:px-8 gap-4' ref={mainPostRef}>
				<div className='flex flex-col gap-1 relative'>
					<div
						className={`${
							post.repliedId ? "bg-black" : ""
						} w-0.5 h-1 md:h-3 relative left-1/2`}
					></div>
					<Image
						src={author.profilePicture}
						width={50}
						height={50}
						className='ceiled-md w-9 h-9 aspect-square object-cover rounded-md border-2 border-black'
						alt='profile picture'
					/>
				</div>
				<div className='flex flex-col gap-0.5 flex-1 py-4'>
					<span className='flex items-center justify-between text-xs'>
						<Link href={`/${author.username}`} className='flex-col'>
							<h3 className='text-sm font-medium'>
								{author.name}
							</h3>
							<h3 className='text-xs font-medium opacity-60'>
								{author.name}#{author.tag}
							</h3>
						</Link>
						<PostActions post={post}/>
					</span>

					<pre
						className={`${sourceCodePro.className} text-sm font-medium mt-0.5 break-words whitespace-pre-wrap`}
					>
						{post.content}
					</pre>
				</div>
			</div>
			<div className='flex px-8 py-3 justify-between border-y-2 border-y-black'>
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
				<PostLoading listener={`${post.id}__reply`} position='bottom' />
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
		</div>
	);
}
