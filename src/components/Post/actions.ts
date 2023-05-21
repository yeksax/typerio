"use server";

import { prisma } from "@/services/prisma";
import { revalidatePath } from "next/cache";

export async function likePost(id: string, user: string) {
	await prisma.post.update({
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
					email: user,
				},
			},
		},
	});
}
