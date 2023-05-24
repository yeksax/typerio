"use server";

import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { FormEvent } from "react";

export async function createPost(data: FormData, user: string) {
	async function updatePercent(percent: number) {
		await fetch(process.env.PAGE_URL! + "/api/pusher/updateStatus", {
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

	const post: _Post = await prisma.post.create({
		data: {
			content: data.get("content")?.toString().trim() as string,
			author: {
				connect: {
					id: user,
				},
			},
		},
		include: {
			author: true,
			likedBy: {
				select: {
					id: true,
				},
			},
			replies: true,
			_count: {
				select: {
					replies: true,
				},
			},
		},
	});

	await updatePercent(70);

	await fetch(process.env.PAGE_URL! + "/api/pusher/newPost", {
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
