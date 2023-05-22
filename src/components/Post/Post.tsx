"use client";
import { User, Post as _Post } from "@prisma/client";
import { Source_Code_Pro } from "next/font/google";
import Image from "next/image";
import {
	useEffect,
	useRef,
	useState
} from "react";
import Like from "./Like";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

interface PostProps {
	post: _Post;
	author: User;
	user: string | undefined;
	likedBy: string[];
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

export default function Post({ post, author, user, likedBy }: PostProps) {
	const [readableTime, setReadableTime] = useState("Há uma cota");
	const timer = useRef<NodeJS.Timer | null>(null);

	const isLiked = !!user ? likedBy.includes(user as string) : false;

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

	return (
		<div className='border-b-2 border-black px-16 py-4 flex gap-4 w-full'>
			<Image
				src={author.profilePicture}
				width={50}
				height={50}
				className='ceiled-md w-9 h-9 aspect-square object-cover'
				alt='profile picture'
			/>
			<div className='flex flex-col gap-0.5 flex-1'>
				<span className='flex gap-1.5 items-center justify-between text-xs'>
					<span className='flex-col'>
						<h3 className='text-sm font-medium'>{author.name}</h3>
						<h3 className='text-xs font-medium opacity-60'>
							{author.name}#{author.tag}
						</h3>
					</span>
					<h3 className='opacity-75'>{readableTime}</h3>
				</span>

				<pre
					className={
						`${sourceCodePro.className} text-sm font-medium mt-2 break-all whitespace-pre-wrap`
					}
				>
					{post.content}
				</pre>

				<div className='flex justify-between text-sm font-medium items-center h-6'>
					<Like
						id={post.id}
						user={user!}
						isLiked={isLiked}
						likeCount={likedBy.length}
					/>
				</div>
			</div>
		</div>
	);
}
