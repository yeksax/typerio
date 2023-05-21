"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, Post as _Post } from "@prisma/client";
import Image from "next/image";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { likePost, unlikePost } from "./actions";
import { useTransition } from "react";

interface PostProps {
	post: _Post;
	user: User;
	likedBy: string[];
}

export default function Post({ post, user, likedBy }: PostProps) {
	const isAuthor = post.userId === user.id;
  const isLiked = likedBy.includes(user.id);

	const iconClass = "w-4 aspect-square";

	const [isPending, startTransition] = useTransition();

	return (
		<div className='border-b-2 border-black px-16 py-4 flex gap-4 w-full'>
			<Image
				src={user.profilePicture}
				width={50}
				height={50}
				className='rounded-md w-9 h-9 aspect-square object-cover '
				alt='profile picture'
			/>
			<div className='flex flex-col gap-0.5 w-full'>
				<div className='flex gap-1.5 items-center'>
					<h3 className='text-sm font-medium'>{user.name}</h3>
					<h4 className='text-xs opacity-75'>
						&bull; {user.name}#{user.tag}
					</h4>
				</div>

				<p className='text-sm font-medium'> {post.content}</p>

				<div className='flex justify-between text-base mt-2'>
					<button
						className='flex gap-1.5 items-center'
						onClick={() => {
							startTransition(() => {
                isLiked ? unlikePost(post.id, user.id) : likePost(post.id, user.id);
							});
						}}
					>
						{likedBy.length > 0 && <span>{likedBy.length}</span>}
						<FontAwesomeIcon icon={faHeart} className={iconClass} />
					</button>
				</div>
			</div>
		</div>
	);
}
