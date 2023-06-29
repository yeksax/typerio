"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { getServerSession } from "next-auth";

const postsPerPage = 20;

export async function getPosts(page: number, clientId?: string) {
	const posts: _Post[] = await prisma.post.findMany({
		skip: (page - 1) * postsPerPage,
		take: postsPerPage,
		where: {
			replied: null,
			deleted: false,
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
			author: {
				include: {
					followers: {
						select: {
							id: true
						}
					},
				},
			},
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
