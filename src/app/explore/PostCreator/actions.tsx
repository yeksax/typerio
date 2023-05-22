"use server";

import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import { FormEvent } from "react";

export async function createPost(data: FormData, user: string) {
	async function updatePercent(percent: number) {
		await fetch(process.env.PAGE_URL! + "/api/pusher/updatePostStatus", {
			method: "POST",
			body: JSON.stringify({
				percent: percent,
				channel: `${user}__post-loading`,
			}),
			cache: "no-store",
		});
	}

	if (data.get("content")!.length == 0) return;
	await updatePercent(10);

	const post = await prisma.post.create({
		data: {
			content: data.get("content")?.toString().trim() as string,
			author: {
				connect: {
					email: user,
				},
			},
			createdAt: new Date(),
		},
		include: {
			author: true,
			likedBy: {
				select: {
					email: true,
				},
			},
		},
	});

	await updatePercent(50);

	fetch(process.env.PAGE_URL! + "/api/pusher/newPost", {
		method: "POST",
		body: JSON.stringify({
			post,
		}),
		cache: "no-store",
	});

	await updatePercent(100);

	pusherClient.subscribe("explore").bind("new-post", async (newPost: any) => {
		pusherClient.unsubscribe("explore");
		if (newPost.id == post.id) {
			await updatePercent(0);
		}
	});

	await updatePercent(0);
}
