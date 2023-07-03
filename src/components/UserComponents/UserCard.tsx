"use client";

import {
	followUser,
	unfollowUser,
} from "@/app/(typer)/[user]/(profile)/actions";
import { followedUsersAtom } from "@/atoms/appState";
import { _User } from "@/types/interfaces";
import { useAtom } from "jotai";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FollowButton } from "./FollowButton";

interface Props {
	session: Session | null;
	user: _User;
}

export default function UserCard({ session, user }: Props) {
	const myID = session?.user?.id;
	const [followedUsers, setFollowedUsers] = useAtom(followedUsersAtom);

	const [isFollowing, setFollowingState] = useState(
		user.followers.length > 0 || followedUsers.includes(user.id)
	);
	const [followsMe, setFollowsMeState] = useState(user.following.length > 0);
	const [isMutual, setMutuallity] = useState(isFollowing && followsMe);

	useEffect(() => {
		setMutuallity(isFollowing && followsMe);
	}, [isFollowing, followsMe]);

	return (
		<Link
			href={`/${user.username}`}
			className='w-full px-4 md:px-8 py-1.5 md:py-3 flex gap-2 md:gap-4'
		>
			<Image
				src={user.avatar}
				width={64}
				height={64}
				alt={`${user.name} avatar`}
				className='w-10 h-10 aspect-square rounded-md border-2 border-black'
			/>
			<div className='flex flex-col text-sm flex-1 gap-0.5 md:gap-1'>
				<div className='flex flex-col'>
					<h3 className='font-semibold'>{user.name}</h3>
					<h5 className='text-xs font-gray-600'>
						{user.name}#{user.tag}
					</h5>
				</div>
				<h5>{user.biography}</h5>
			</div>

			{session && user.id != myID && (
				<FollowButton
					isFollowing={isFollowing}
					target={user.id}
					user={myID!}
					setFollowState={setFollowingState}
				/>
			)}
		</Link>
	);
}

