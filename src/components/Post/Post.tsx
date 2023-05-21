"use client";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User, Post as _Post } from "@prisma/client";
import Image from "next/image";
import {
	useEffect,
	experimental_useOptimistic as useOptimistic,
	useRef,
	useState
} from "react";
import { likePost, unlikePost } from "./actions";

interface PostProps {
	post: _Post;
	author: User;
	user: string | undefined;
	likedBy: string[];
}

function getReadableTime(time: number) {
	if (time < 60) return `${Math.ceil(time)}s`;
	if (time <= 60 * 60) return `${Math.ceil(time / 60)}m`;
	if (time <= 60 * 60 * 24) return `${Math.ceil(time / 60 / 60)}h`;
	if (time <= 60 * 60 * 24 * 30) return `${Math.ceil(time / 60 / 60 / 24)}d`;
	return "Há uma cota";
}

export default function Post({ post, author, user, likedBy }: PostProps) {
	const [optimisticLikes, addOptmisticLikes] = useOptimistic(
		{ likedBy, sending: false },
		(state, newLikes: string[]) => ({
			...state,
			likedBy: newLikes,
			sending: true,
		})
	);

	const [readableTime, setReadableTime] = useState("Há uma cota");
	const timer = useRef<NodeJS.Timer | null>(null);

	const [isLiked, setIsLiked] = useState(!!user ? likedBy.includes(user as string) : false);

	const iconClass = "w-4 aspect-square";

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
				className='ceiled-md w-9 h-9 aspect-square object-cover '
				alt='profile picture'
			/>
			<div className='flex flex-col gap-0.5 w-full'>
				<div className='flex gap-1.5 items-center'>
					<h3 className='text-sm font-medium'>{author.name}</h3>
					<h4 className='text-xs opacity-75'>
						&bull; {author.name}#{author.tag} &bull; {readableTime}
					</h4>
				</div>

				<pre className='text-sm font-medium'>{post.content}</pre>

				<div className='flex justify-between text-sm font-medium mt-2'>
					<button
						className='flex gap-1.5 items-center w-12'
						onClick={async () => {
							if (!user) return;

							if(isLiked){
								addOptmisticLikes(optimisticLikes.likedBy.filter(like => like !== user));
								setIsLiked(false)
								await unlikePost(post.id, user)
							} else {
								addOptmisticLikes([user, ...optimisticLikes.likedBy]);
								setIsLiked(true)
								await likePost(post.id, user)
							}
						}}
					>
						{isLiked && (
							<FontAwesomeIcon
								icon={faHeartSolid}
								className={iconClass}
							/>
						)}
						{!isLiked && (
							<FontAwesomeIcon
								icon={faHeart}
								className={iconClass}
							/>
						)}
						{optimisticLikes.likedBy.length > 0 && <span>{optimisticLikes.likedBy.length}</span>}
					</button>
				</div>
			</div>
		</div>
	);
}
