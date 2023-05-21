"use server";

import { prisma } from "@/services/prisma";

export async function likePost(id: string, user: string) {
	const post = await prisma.post.update({
		where: {
			id: id,
		},
		data: {
			likedBy: {
				connect: {
					email: user,
				},
			},
		},
		select: {
			likedBy: {
				select: {
					email: true,
				},
			},
		},
	});

	return post.likedBy;
}

export async function unlikePost(id: string, user: string) {
	const post = await prisma.post.update({
		where: {
			id: id,
		},
		data: {
			likedBy: {
				disconnect: {
					email: user,
				},
			},
		},
		select: {
			likedBy: {
				select: {
					email: true,
				},
			},
		},
	});

	return post.likedBy;
}
