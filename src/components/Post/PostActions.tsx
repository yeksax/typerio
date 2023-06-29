import {
	followUser,
	unfollowUser,
} from "@/app/(typer)/[user]/(profile)/actions";
import { useUser } from "@/hooks/UserContext";
import { _Post } from "@/types/interfaces";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { FiTrash, FiUserMinus, FiUserPlus } from "react-icons/fi";
import { TbPinned, TbPinnedOff } from "react-icons/tb";
import { deletePost, pinPost, unpinPost } from "./actions";

interface Props {
	post: _Post;
}

export default function PostActions({ post }: Props) {
	const [showActions, setShowActions] = useState(false);
	const [isFollowing, setFollowingState] = useState(false);
	const [isPinned, setPinned] = useState(false);
	const [isAuthor, setAuthor] = useState(false);
	const [isPeding, startTransition] = useTransition();
	const { data: session } = useSession();
	const user = useUser();

	useEffect(() => {
		if (user?.pinnedPostId === post.id) {
			setPinned(true);
		}
	}, [user]);

	useEffect(() => {
		if (session?.user?.id === post.author.id) {
			setAuthor(true);
		}

		if (post.author.followers) {
			if (
				post.author.followers.find((f) => f.id === session?.user?.id) !=
				undefined
			)
				setFollowingState(true);
		}
	}, [post.author.id, session]);

	return (
		<div className='relative'>
			<div
				className='h-4 w-4 cursor-pointer flex justify-end items-center'
				onClick={() => setShowActions(!showActions)}
			>
				<FontAwesomeIcon size='lg' className='h-3' icon={faEllipsisV} />
			</div>
			<motion.div
				className={`${
					showActions ? "pointer-events-auto" : "pointer-events-none"
				} flex flex-col rounded-md w-max z-50 gap-3 absolute bg-white px-2 md:px-4 py-1 md:py-2 border-2 border-black`}
				onMouseLeave={() => setShowActions(false)}
				initial={{ opacity: 0, y: -10, top: "150%", right: 0 }}
				animate={{
					opacity: showActions ? 1 : 0,
					y: showActions ? 0 : 10,
				}}
			>
				{session && (
					<>
						<div
							className='flex gap-2 items-center cursor-pointer'
							onClick={async () => {
								if (isPinned) {
									setPinned(false);
									await pinPost(post.id, session);
								} else {
									setPinned(true);
									await unpinPost(post.id, session);
								}
							}}
						>
							{isPinned ? (
								<>
									<TbPinnedOff size={12} /> Desfixar
								</>
							) : (
								<>
									<TbPinned size={12} /> Fixar
								</>
							)}
						</div>
						{session.user?.id !== post.author.id && (
							<div
								className='flex items-center gap-4 cursor-pointer'
								onClick={async () => {
									if (isFollowing) {
										setFollowingState(false);
										await unfollowUser(
											post.author.id,
											session.user!.id
										);
									} else {
										setFollowingState(true);
										await followUser(
											post.author.id,
											session.user!.id
										);
									}
								}}
							>
								{isFollowing ? (
									<span className='text-red-500 items-center flex gap-2'>
										<FiUserMinus />
										Unfollow
									</span>
								) : (
									<span className='flex items-center gap-2'>
										<FiUserPlus />{" "}
										<span className='font-semibold'>
											Seguir
										</span>{" "}
										{post.author.name}
									</span>
								)}
							</div>
						)}
					</>
				)}
				{isAuthor && (
					<>
						<div className='flex items-center gap-2 cursor-pointer'>
							<FiTrash className='text-red-500' />
							<button
								className='text-red-500'
								onClick={() =>
									startTransition(() =>
										deletePost(
											post.id,
											post.author.username
										)
									)
								}
							>
								Apagar
							</button>
						</div>
					</>
				)}
			</motion.div>
		</div>
	);
}
