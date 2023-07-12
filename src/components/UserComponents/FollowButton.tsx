"use client";

import {
	followUser,
	unfollowUser,
} from "@/app/(typer)/[user]/(profile)/actions";
import { followedUsersAtom, unfollowedUsersAtom } from "@/atoms/appState";
import { SetStateAction, useAtom } from "jotai";
import { Dispatch, useEffect, useState } from "react";

export function FollowButton({
	isFollowing: _isFollowing,
	setFollowState,
	target,
	user,
}: {
	isFollowing: boolean;
	target: string;
	user: string;
	setFollowState?: Dispatch<SetStateAction<boolean>>;
}) {
	const [isHovering, setIsHovering] = useState(false);
	const [followedUsers, setFollowedUsers] = useAtom(followedUsersAtom);
	const [unfollowedUsers, setUnfollowedUsers] = useAtom(unfollowedUsersAtom);
	const [isFollowing, setIsFollowing] = useState(
		(_isFollowing || followedUsers.includes(target)) &&
			!unfollowedUsers.includes(target)
	);

	useEffect(() => {
		setIsFollowing(
			(_isFollowing || followedUsers.includes(target)) &&
				!unfollowedUsers.includes(target)
		);
	}, [_isFollowing, unfollowedUsers, followedUsers]);

	if (isFollowing)
		return (
			<button
				onClick={async (e) => {
					e.preventDefault();
					setUnfollowedUsers((prev) => [...prev, target]);
					setFollowedUsers((users) =>
						users.filter((prev) => prev != target)
					);
					if (setFollowState) setFollowState(false);
					await unfollowUser(target);
				}}
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				className='text-xs h-6 cursor-pointer px-3 bg-white dark:bg-zinc-950 grid place-items-center py-0.5 text-black dark:text-zinc-50 rounded-md hover:text-white hover:bg-black transition-all border-black dark:hover:bg-zinc-800 dark:border-zinc-950 border-2'
			>
				{isHovering ? "Unfollow" : "Seguindo"}
			</button>
		);

	return (
		<button
			onClick={async (e) => {
				e.preventDefault();
				if (setFollowState) setFollowState(true);
				setFollowedUsers((prev) => [...prev, target]);
				setUnfollowedUsers((users) =>
					users.filter((prev) => prev != target)
				);
				await followUser(target);
			}}
			className='text-xs h-6 cursor-pointer px-3 bg-white dark:bg-zinc-800 grid place-items-center py-0.5 text-black dark:text-zinc-50 rounded-md hover:text-white hover:bg-black transition-all border-black dark:hover:bg-zinc-950 dark:border-zinc-950 border-2'
		>
			Seguir
		</button>
	);
}
