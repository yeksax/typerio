"use server";

import { prisma } from "@/services/prisma";

export async function likePost(id: string, user: string) {
	await prisma.post.update({
		where: {
			id: id,
		},
		data: {
			likedBy: {
				connect: {
					id: user,
				},
			},
		},
	});
}

export async function unlikePost(id: string, user: string) {
	await prisma.post.update({
		where: {
			id: id,
		},
		data: {
			likedBy: {
				disconnect: {
					id: user,
				},
			},
		},
	});
}
