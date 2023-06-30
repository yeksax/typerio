"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getPosts } from "@/utils/server/posts";
import { getServerSession } from "next-auth";
import PinnedPost from "./PinnedPost";
import ProfilePosts from "./ProfilePosts";

interface Props {
	params: {
		user: string;
	};
}

export default async function UserPage({ params }: Props) {
	const session = await getServerSession(authOptions);
	const posts = await getPosts({ page: 1, owner: params.user, session });
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
					attachments: true,
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
		user && (
			<>
				<PinnedPost
					session={session}
					post={user.pinnedPost}
					user={user.username}
					key={new Date().getTime()}
				/>
				<ProfilePosts
					profile={user.username}
					session={session}
					posts={posts}
				/>
			</>
		)
	);
}
