"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { pusherClient, pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { removeAccents } from "@/utils/general/string";
import { updatePercent } from "@/utils/server/loadingBars";
import { getServerSession } from "next-auth";

export async function createPost(
	data: FormData,
	fileUrls: string[]
) {
	const session = await getServerSession(authOptions)
	const user = session?.user?.id

	if(!user) return

	const content = data.get("content");

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

	if (fileUrls.length > 0) await updatePercent(channel, 70);
	else await updatePercent(channel, 100);

	await pusherServer.trigger("explore", "new-post", post);
	await pusherServer.trigger(`user__${removeAccents(post.author.username)}__post`, "new-post", post);

	await updatePercent(channel, 100);

	pusherClient.subscribe("explore").bind("new-post", async (newPost: any) => {
		pusherClient.unsubscribe("explore");
		if (newPost.id == post.id) {
			await updatePercent(channel, 0);
		}
	});

	await updatePercent(channel, 0);
}
