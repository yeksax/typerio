"use server";

import { prisma } from "@/services/prisma";
import { pusherClient, pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { updatePercent } from "@/utils/server/loadingBars";

export async function createPost(
	data: FormData,
	user: string,
	fileUrls: string[]
) {
	const content = data.get("content");
	const invite = data.get("inviteChat")?.toString();
	const inviteCode = data.get("inviteCode")?.toString();

	const channel = `${user}__post-loading`;

	if (content!.length == 0 && fileUrls.length === 0) return;
	if (fileUrls.length > 0) await updatePercent(channel, 40);
	else await updatePercent(channel, 10);

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
						name: "image",
						size: 0,
						url: file,
					})),
				},
			},
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

	if (fileUrls.length > 0) await updatePercent(channel, 40);
	else await updatePercent(channel, 70);

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

	if (fileUrls.length > 0) await updatePercent(channel, 70);
	else await updatePercent(channel, 100);

	await fetch(process.env.PAGE_URL! + "/api/pusher/newPost", {
		method: "POST",
		body: JSON.stringify({
			post,
		}),
		cache: "no-store",
	});

	await updatePercent(channel, 100);

	pusherClient.subscribe("explore").bind("new-post", async (newPost: any) => {
		pusherClient.unsubscribe("explore");
		if (newPost.id == post.id) {
			await updatePercent(channel, 0);
		}
	});

	await updatePercent(channel, 0);
}
