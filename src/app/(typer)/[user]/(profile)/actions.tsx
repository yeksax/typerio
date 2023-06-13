"use server";

import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { Session } from "next-auth";
import { revalidatePath } from "next/cache";

export async function followUser(target: string, user: string) {
	const userInfo =await prisma.user.update({
		where: {
			id: target,
		},
		data: {
			followers: {
				connect: {
					id: user,
				},
			},
		},
	});

	revalidatePath(`/${removeAccents(userInfo.username)}`)
	revalidatePath(`/${user}`)
}

export async function unfollowUser(target: string, user: string) {
	const userInfo = await prisma.user.update({
		where: {
			id: target,
		},
		data: {
			followers: {
				disconnect: {
					id: user,
				},
			},
		},
	});

	revalidatePath(`/${removeAccents(userInfo.username)}`)
	revalidatePath(`/${user}`)
}

const postsPerPage = 20

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
			author: session?.user?.id ? {
				include: {
					followers: {
						where: {
							id: session.user.id
						}
					}
				}
			}: true,
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