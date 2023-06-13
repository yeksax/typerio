"use server";

import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";

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

	const content = data.get("content");
	const invite = data.get("inviteChat")?.toString();
	const inviteCode = data.get("inviteCode")?.toString();

	if (content!.length == 0) return;
	await updatePercent(10);

	let post: _Post = await prisma.post.create({
		data: {
			content: content!.toString().trim() as string,
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
			_count: {
				select: {
					replies: true,
					likedBy: true,
				},
			},
		},
	});

	await updatePercent(30);

	if (inviteCode != "") {
		const newInvite = await prisma.post.update({
			where: {
				id: post.id,
			},
			data: {
				invite: {
					create: {
						code: inviteCode!,
						chat: {
							connect: {
								id: invite!,
							},
						},
						owner: {
							connect: {
								id: user,
							},
						},
					},
				},
			},
			select: {
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
			},
		});

		post = {
			...post,
			invite: newInvite.invite,
		};
	}

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
