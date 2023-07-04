"use server";

import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Message } from "@/types/interfaces";
import { updatePercent } from "@/utils/server/loadingBars";

export async function sendMessage(
	e: FormData,
	user: string,
	chatId: string,
	mention: _Message | null
) {
	const channel = `${user}__sending-message`;

	const content = e.get("content");
	if (!content) return;

	await updatePercent(channel, 30);

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

	await updatePercent(channel, 50);

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

	await updatePercent(channel, 70);

	await fetch(process.env.PAGE_URL! + `/api/chat/${chatId}/newMessage`, {
		method: "POST",
		body: JSON.stringify({
			message,
		}),
		cache: "no-store",
	});

	await updatePercent(channel, 100);
	await updatePercent(channel, 0);
}

export async function sendAudio(
	audioUrl: string,
	user: string,
	chatId: string,
	mention: _Message | null
) {
	const channel = `${user}__sending-message`;
	await updatePercent(channel, 30);

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

	await updatePercent(channel, 50);

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

	await updatePercent(channel, 70);

	await fetch(process.env.PAGE_URL! + `/api/chat/${chatId}/newMessage`, {
		method: "POST",
		body: JSON.stringify({
			message,
		}),
		cache: "no-store",
	});

	await updatePercent(channel, 100);
	await updatePercent(channel, 0);
}

export async function readMessages(messages: string[], user: string) {
	await prisma.user.update({
		where: {
			id: user,
		},
		data: {
			messagesRead: {
				connect: messages.map((msg) => ({
					id: msg,
				})),
			},
		},
	});
}

export async function statusUpdate({
	chat,
	user,
	status,
}: {
	chat: string;
	user: string;
	status: string | null;
}) {
	const channel = `chat__${chat}__status`;
	const event = `update-status`;

	await pusherServer.trigger(channel, event, {status, user});
}
