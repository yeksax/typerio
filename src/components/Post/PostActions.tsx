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
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiTrash, FiUserMinus, FiUserPlus } from "react-icons/fi";
import { TbPinned, TbPinnedOff } from "react-icons/tb";
import { deletePost, pinPost, unpinPost } from "./actions";

interface Props {
	post: _Post;
}

export default function PostActions({ post }: Props) {
	const [showActions, setShowActions] = useState(false);
	const [isFollowing, setFollowingState] = useState(false);
	const [isAuthor, setAuthor] = useState(false);
	const { data: session } = useSession();
	const [followedUsers, setFollowedUsers] = useAtom(followedUsersAtom);
	const [unfollowedUsers, setUnfollowedUsers] = useAtom(unfollowedUsersAtom);

	const [currentPinned, setPinned] = useAtom(pinnedPostAtom);

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
			<button
				className='h-4 w-4 cursor-pointer flex justify-end items-center icon-hitbox'
				onClick={() => setShowActions(!showActions)}
			>
				<FontAwesomeIcon size='lg' className='h-3' icon={faEllipsisV} />
			</button>
			<motion.div
				className={`${
					showActions ? "pointer-events-auto" : "pointer-events-none"
				} flex flex-col rounded-md w-max z-50 gap-3 absolute bg-white dark:bg-zinc-800 px-2 md:px-4 py-1 md:py-2 border-2 dark:border-zinc-950 border-black`}
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
							className='flex gap-2 items-center cursor-pointer'
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
						{session.user?.id !== post.author.id && (
							<button
								className='flex items-center gap-4 cursor-pointer'
								onClick={async () => {
									if (isFollowing) {
										setFollowingState(false);
										setUnfollowedUsers((prev) => [
											...prev,
											post.author.id,
										]);
										setFollowedUsers((users) =>
											users.filter(
												(prev) => prev != post.author.id
											)
										);

										await unfollowUser(
											post.author.id,
											session.user!.id
										);
									} else {
										setFollowingState(true);
										setFollowedUsers((prev) => [
											...prev,
											post.author.id,
										]);
										setUnfollowedUsers((users) =>
											users.filter(
												(prev) => prev != post.author.id
											)
										);

										await followUser(
											post.author.id,
											session.user!.id
										);
									}
								}}
							>
								{isFollowing ? (
									<button className='text-red-500 items-center flex gap-2'>
										<FiUserMinus />
										Unfollow
									</button>
								) : (
									<button className='flex items-center gap-2'>
										<FiUserPlus />{" "}
										<span className='font-semibold'>
											Seguir
										</span>{" "}
										{post.author.name}
									</button>
								)}
							</button>
						)}
					</>
				)}
				{isAuthor && (
					<>
						<button
							className='flex items-center gap-2 cursor-pointer'
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
