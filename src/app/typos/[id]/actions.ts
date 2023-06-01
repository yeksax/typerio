"use server";

import { prisma } from "@/services/prisma";

export async function sendMessage(e: FormData, user: string, chatId: string) {
	async function updatePercent(percent: number) {
		await fetch(process.env.PAGE_URL! + "/api/pusher/updateStatus", {
			method: "POST",
			body: JSON.stringify({
				percent: percent,
				channel: `${user}__sending-message`,
			}),
			cache: "no-store",
		});
	}

	const content = e.get("content");
	if (!content) return;

	await updatePercent(30);

	const message = await prisma.message.create({
		data: {
			content: content as string,
			readBy: {
				connect: {
					id: user,
				},
			},
			author: {
				connect: {
					id: user,
				},
			},
			chat: {
				connect: {
					id: chatId,
				},
			},
		},
		include: {
			author: true,
		},
	});

	await updatePercent(70);

	await fetch(process.env.PAGE_URL! + `/api/chat/${chatId}/newMessage`, {
		method: "POST",
		body: JSON.stringify({
			message,
		}),
		cache: "no-store",
	});

	await updatePercent(100);
	await updatePercent(0);
}
