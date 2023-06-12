"use server";

import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { Session } from "next-auth";
import { revalidatePath } from "next/cache";

export async function followUser(target: string, user: string) {
	await prisma.user.update({
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

	revalidatePath(`/${target}`)
	revalidatePath(`/${user}`)
}

export async function unfollowUser(target: string, user: string) {
	await prisma.user.update({
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

	revalidatePath(`/${target}`)
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