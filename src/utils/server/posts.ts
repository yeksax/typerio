"use server";

import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { Session } from "next-auth";
import { POSTS_PER_PAGE } from "../general/usefulConstants";

export async function getPosts({
	owner,
	page,
	session,
}: {
	page: number;
	owner?: string;
	session: Session | null;
}): Promise<_Post[]> {
	const posts = await prisma.post.findMany({
		skip: (page - 1) * POSTS_PER_PAGE,
		take: POSTS_PER_PAGE,
		where: {
			replied: null,
			deleted: false,
			AND: owner
				? {
						author:
							owner == "me" && session
								? { id: session?.user?.id }
								: { username: owner },
				  }
				: {},
		},
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
					replies: {
						where: {
							deleted: false
						}
					},
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
