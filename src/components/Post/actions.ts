"use server";

import { prisma } from "@/services/prisma";
import { revalidatePath } from "next/cache";

export async function likePost(id: string, user: string) {
	const post = await prisma.post.update({
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
		select: {
			likedBy: {
				select: {
					id: true,
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
					id: user,
				},
			},
		},
		select: {
			likedBy: {
				select: {
					id: true,
				},
			},
		},
	});

	return post.likedBy;
}

export async function reply(postId: string, user: string, data: FormData) {
	async function updatePercent(percent: number) {
		await fetch(process.env.PAGE_URL! + "/api/pusher/updateStatus", {
			method: "POST",
			body: JSON.stringify({
				percent: percent,
				channel: `${user}__${postId}__reply`,
			}),
			cache: "no-store",
		});
	}

	await updatePercent(10);
	if (data.get("content")!.length == 0) return;

	await updatePercent(30);

	const reply = await prisma.post.create({
		data: {
			content: data.get("content")?.toString().trim()!,
			replied: {
				connect: {
					id: postId,
				},
			},
			author: {
				connect: {
					id: user,
				},
			},
		},
	});

	await updatePercent(70);

	await fetch(process.env.PAGE_URL! + "/api/pusher/newReply", {
		method: "POST",
		body: JSON.stringify({
			id: postId,
		}),
		cache: "no-store",
	});

	await updatePercent(100);
	await updatePercent(0);
}
