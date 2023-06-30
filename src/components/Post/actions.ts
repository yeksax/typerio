"use server";

import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { User } from "@prisma/client";
import { Session } from "next-auth";

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

export async function pinPost(postID: string, session: Session) {
	const user: User & { pinnedPost: _Post | null } = await prisma.user.update({
		where: {
			id: session.user!.id,
		},
		data: {
			pinnedPostId: postID,
		},
		include: {
			pinnedPost: {
				include: {
					attachments: true,
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
					author: session?.user?.id
						? {
								include: {
									followers: {
										where: {
											id: session.user.id,
										},
									},
								},
						  }
						: true,
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
			},
		},
	});

	await pusherServer.trigger(
		`user__${user.username}__pinned`,
		"pin",
		user.pinnedPost
	);
}

export async function unpinPost(post: string, session: Session) {
	const user = await prisma.user.update({
		where: {
			id: session.user!.id,
		},
		data: {
			pinnedPostId: null,
		},
	});

	await pusherServer.trigger(`user__${user.username}__pinned`, "unpin", null);
}
