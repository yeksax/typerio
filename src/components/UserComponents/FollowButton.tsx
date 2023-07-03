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
		console.log(_isFollowing, unfollowedUsers, followedUsers);

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
					if(setFollowState) setFollowState(false);
					await unfollowUser(target, user);
				}}
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				className='rounded-md py-0.5 px-4 border-2 bg-black border-black text-white hover:text-black hover:bg-white transition-all text-xs h-fit'
			>
				{isHovering ? "Unfollow" : "Seguindo"}
			</button>
		);

	return (
		<button
			onClick={async (e) => {
				e.preventDefault();
				if(setFollowState) setFollowState(true);
				setFollowedUsers((prev) => [...prev, target]);
				setUnfollowedUsers((users) =>
					users.filter((prev) => prev != target)
				);
				await followUser(target, user);
			}}
			className='rounded-md py-0.5 px-4 border-2 border-black hover:text-white hover:bg-black transition-all text-xs h-fit'
		>
			Seguir
		</button>
	);
}
