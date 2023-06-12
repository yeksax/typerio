"use server";

import { prisma } from "@/services/prisma";
import ProfilePosts from "./ProfilePosts";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { _Post } from "@/types/interfaces";

interface Props {
	params: {
		user: string;
	};
}

const postsPerPage = 20;

export async function getProfilePosts(
	page: number,
	owner: string,
	session: Session | null
): Promise<_Post[]> {
	const posts = await prisma.post.findMany({
		skip: (page - 1) * postsPerPage,
		take: postsPerPage,
		where: {
			replied: null,
			deleted: false,
			AND: {
				author:
					owner == "me" && session
						? { id: session?.user?.id }
						: { username: owner },
			},
		},
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
			author: true,
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
		orderBy: {
			createdAt: "desc",
		},
	});

	return posts;
}

export default async function UserPage({ params }: Props) {
	const session = await getServerSession(authOptions);

	const posts = await getProfilePosts(1, params.user, session);

	return (
		<ProfilePosts profile={params.user} session={session} posts={posts} />
	);
}
