"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { revalidatePath, revalidateTag } from "next/cache";

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

	const { thread: mainThread } = await prisma.post.findUniqueOrThrow({
		where: {
			id: postId,
		},
		select: {
			thread: true,
		},
	});

	const reply: _Post = await prisma.post.create({
		data: {
			content: data.get("content")?.toString().trim()!,
			thread: {
				connect: [
					...mainThread.map((t) => ({ id: t.id })),
					{ id: postId },
				],
			},
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

	await fetch(process.env.PAGE_URL! + `/api/posts/${postId}/reply`, {
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

export async function deletePost(post: string, author?: string) {
	await fetch(process.env.PAGE_URL! + `/api/posts/${post}`, {
		method: "DELETE",
		cache: "no-store",
	});
}

export async function pinPost(post: string, session: Session) {
	await prisma.user.update({
		where: {
			id: session.user!.id,
		},
		data: {
			pinnedPost: {
				connect: {
					id: post,
				},
			},
		},
	});
}

export async function unpinPost(post: string, session: Session) {
	await prisma.user.update({
		where: {
			id: session.user!.id,
		},
		data: {
			pinnedPost: {
				disconnect: true,
			},
		},
	});
}
