"use server";

import { prisma } from "@/services/prisma";
import ProfilePosts from "./ProfilePosts";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { _Post } from "@/types/interfaces";
import { getProfilePosts } from "./actions";
import Head from "next/head";
import Post from "@/components/Post/Post";
import { TbPinned } from "react-icons/tb";

interface Props {
	params: {
		user: string;
	};
}

export default async function UserPage({ params }: Props) {
	const session = await getServerSession(authOptions);
	const posts = await getProfilePosts(1, params.user, session);
	const user = await prisma.user.findUnique({
		where:
			params.user === "me"
				? {
						id: session?.user?.id,
				  }
				: {
						username: params.user,
				  },
		include: {
			pinnedPost: {
				include: {
					invite: {
						include: {
							owner: true,
							chat: {
								include: {
									_count: {
										select: {
											members: true,
										},
									},
								},
							},
						},
					},
					author: session?.user?.id
						? {
								include: {
									followers: {
										where: {
											id: session.user.id,
										},
									},
								},
						  }
						: true,
					likedBy: {
						select: {
							id: true,
						},
					},
					_count: {
						select: {
							replies: true,
							likedBy: true,
						},
					},
				},
			},
		},
	});

	return (
		<>
			{user?.pinnedPostId && (
				<div className='flex flex-col pt-2'>
					<div className='text-xs text-gray-600 px-4 md:px-8 flex gap-4 -mb-1.5'>
						<TbPinned/>
						Post fixado
					</div>
					<Post post={user.pinnedPost!} user={session?.user!.id} />
				</div>
			)}

			<ProfilePosts
				profile={params.user}
				session={session}
				posts={posts}
			/>
		</>
	);
}
