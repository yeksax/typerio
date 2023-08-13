import {
	followUser,
	unfollowUser,
} from "@/app/(typer)/[user]/(profile)/actions";
import {
	followedUsersAtom,
	pinnedPostAtom,
	unfollowedUsersAtom,
} from "@/atoms/appState";
import { _Post } from "@/types/interfaces";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { FiMoreVertical, FiTrash, FiUserMinus, FiUserPlus } from "react-icons/fi";
import { TbPinned, TbPinnedOff } from "react-icons/tb";
import { deletePost, pinPost, unpinPost } from "./actions";

interface Props {
	post: _Post;
	session?: Session | null;
}

export default function PostActions({ post, session }: Props) {
	const [showActions, setShowActions] = useState(false);
	const [isFollowing, setFollowingState] = useState(false);
	const [isAuthor, setAuthor] = useState(false);
	const [followedUsers, setFollowedUsers] = useAtom(followedUsersAtom);
	const [unfollowedUsers, setUnfollowedUsers] = useAtom(unfollowedUsersAtom);

	const [currentPinned, setPinned] = useAtom(pinnedPostAtom);

	useEffect(() => {
		if (session?.user?.id === post.userId) {
			setAuthor(true);
		}

		if (post.author.followers) {
			if (
				post.author.followers.find((f) => f.id === session?.user?.id) !=
				undefined
			)
				setFollowingState(true);
		}
	}, []);

	const actionClass =
		"flex items-center gap-4 px-3 md:px-4 py-1 cursor-pointer";

	return (
		<div className='relative'>
			<button
				className='h-4 w-4 cursor-pointer flex justify-end items-center icon-hitbox'
				onClick={() => setShowActions(!showActions)}
			>
				<FiMoreVertical size={14} />
			</button>
			<motion.div
				className={`${
					showActions ? "pointer-events-auto" : "pointer-events-none"
				} flex flex-col rounded-md w-max z-50 absolute bg-white dark:bg-zinc-800 border-2 dark:border-zinc-950 border-black`}
				onMouseLeave={() => setShowActions(false)}
				initial={{ opacity: 0, y: -10, top: "150%", right: 0 }}
				animate={{
					opacity: showActions ? 1 : 0,
					y: showActions ? 0 : 10,
				}}
			>
				{session && (
					<>
						<button
							className={actionClass}
							onClick={async () => {
								if (currentPinned === post.id) {
									setPinned(null);
									await unpinPost(post.id, session);
								} else {
									setPinned(post.id);
									await pinPost(post.id, session);
								}
							}}
						>
							{currentPinned === post.id ? (
								<>
									<TbPinnedOff size={12} /> Desfixar
								</>
							) : (
								<>
									<TbPinned size={12} /> Fixar
								</>
							)}
						</button>
						{session.user.id !== post.userId && (
							<button
								className={actionClass}
								onClick={async () => {
									if (isFollowing) {
										setFollowingState(false);
										setUnfollowedUsers((prev) => [
											...prev,
											post.userId,
										]);
										setFollowedUsers((users) =>
											users.filter(
												(prev) => prev != post.userId
											)
										);

										await unfollowUser(post.userId);
									} else {
										setFollowingState(true);
										setFollowedUsers((prev) => [
											...prev,
											post.userId,
										]);
										setUnfollowedUsers((users) =>
											users.filter(
												(prev) => prev != post.userId
											)
										);

										await followUser(post.userId);
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
										<FiUserPlus />
										<span className='font-semibold'>
											Seguir
										</span>{" "}
										{post.author.name}
									</span>
								)}
							</button>
						)}
					</>
				)}
				{isAuthor && (
					<>
						<button
							className={actionClass}
							onClick={async () =>
								await deletePost(post.id, post.author.username)
							}
						>
							<FiTrash className='text-red-500' />
							<span className='text-red-500'>Apagar</span>
						</button>
					</>
				)}
			</motion.div>
		</div>
	);
}
