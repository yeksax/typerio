"use server";

import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import { _Post } from "@/types/interfaces";

export async function createPost(data: FormData, user: string, fileUrls: string[]) {
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
	const files = data.getAll("files") as File[];

	if (content!.length == 0 && files.length === 0) return;
	if (files.length > 0) await updatePercent(40);
	else await updatePercent(10);

	let post: _Post = await prisma.post.create({
		data: {
			content: content?.toString().trim() || "",
			author: {
				connect: {
					id: user,
				},
			},
			attachments: {
				createMany: {
					data: fileUrls.map((file, i) => ({
						name: files[i].name,
						size: files[i].size,
						url: file
					}))
				}
			}
		},
		include: {
			attachments: true,
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

	if (files.length > 0) await updatePercent(40);
	else await updatePercent(70);

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

	if (files.length > 0) await updatePercent(70);
	else await updatePercent(100);

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
