"use server";

import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { revalidatePath } from "next/cache";

export async function likePost(post: string, user: string) {
	await fetch(process.env.PAGE_URL! + `/api/posts/${post}/like`, {
		method: "POST",
		body: JSON.stringify({
			post,
			user,
		}),
		cache: "no-store",
	});
}

export async function unlikePost(post: string, user: string) {
	await fetch(process.env.PAGE_URL! + `/api/posts/${post}/unlike`, {
		method: "POST",
		body: JSON.stringify({
			post,
			user,
		}),
		cache: "no-store",
	});
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

	const reply: _Post = await prisma.post.create({
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
		include: {
			likedBy: true,
			author: true,
			replied: {
				include: {
					author: true,
				},
			},
			_count: {
				select: {
					replies: true,
					likedBy: true,
				},
			},
		},
	});

	await updatePercent(70);

	await fetch(process.env.PAGE_URL! + "/api/pusher/newReply", {
		method: "POST",
		body: JSON.stringify({
			id: postId,
			reply: reply,
		}),
		cache: "no-store",
	});

	await updatePercent(100);
	await updatePercent(0);
}
