"use server";

import { prisma } from "@/services/prisma";
import { _Message } from "@/types/interfaces";

export async function sendMessage(
	e: FormData,
	user: string,
	chatId: string,
	mention: _Message | null
) {
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

	let message = await prisma.message.create({
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
			readBy: true,
		},
	});

	await updatePercent(50);

	if (mention) {
		message = await prisma.message.update({
			where: {
				id: message.id,
			},
			include: {
				author: true,
				readBy: true,
				mention: {
					include: {
						author: true,
					},
				},
			},
			data: {
				mention: {
					connect: {
						id: mention.id,
					},
				},
			},
		});
	}

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

export async function sendAudio(
	audioUrl: string,
	user: string,
	chatId: string,
	mention: _Message | null
) {
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

	await updatePercent(30);

	let message = await prisma.message.create({
		data: {
			readBy: {
				connect: {
					id: user,
				},
			},
			audio: audioUrl,
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
			readBy: true,
		},
	});

	await updatePercent(50);

	if (mention) {
		message = await prisma.message.update({
			where: {
				id: message.id,
			},
			include: {
				author: true,
				readBy: true,
				mention: {
					include: {
						author: true,
					},
				},
			},
			data: {
				mention: {
					connect: {
						id: mention.id,
					},
				},
			},
		});
	}

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

export async function updatePercent(
	percent: number,
	user: string,
	channelName: string
) {
	await fetch(process.env.PAGE_URL! + "/api/pusher/updateStatus", {
		method: "POST",
		body: JSON.stringify({
			percent: percent,
			channel: `${user}__${channelName}`,
		}),
		cache: "no-store",
	});

	return;
}
