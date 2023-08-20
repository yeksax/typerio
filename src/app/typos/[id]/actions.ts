"use server";

import { newPushNotification } from "@/utils/server/userNotifications";
import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Message } from "@/types/interfaces";
import { updatePercent } from "@/utils/server/loadingBars";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";

async function newMessage(message: _Message) {
	await pusherServer.trigger(
		`chat__${message.chatId}`,
		"new-message",
		message
	);

	const chat = await prisma.chat.findFirstOrThrow({
		where: {
			id: message.chatId,
		},
		include: {
			members: {
				include: {
					silencedChats: true,
				},
			},
		},
	});

	const { members } = chat;
	for (let i = 0; i < members!.length; i++) {
		let member = members?.at(i);
		if (!member) continue;

		let shouldNotify = true;
		if (member.id === message.author.id) {
			shouldNotify = false;
			continue;
		}

		for (let j = 0; j < member.silencedChats.length; j++) {
			let silencedChat = member.silencedChats[j];

			if (silencedChat.id === chat.id) shouldNotify = false;
		}

		if (shouldNotify)
			await newPushNotification({
				userID: member.id,
				scope: "allowDMNotifications",
				notification: {
					action: "REPLY",
					notificationActors: { users: [message.author] },
					redirect: `/typos/${message.author.username}`,
					text: !!message.audio ? "Audio" : message.content,
					title: `${message.author.name} enviou uma mensagem`,
					icon: message.author.avatar,
				},
			});
	}
}

export async function sendMessage(
	e: FormData,
	chatId: string,
	mention: _Message | null
) {
	const session = await getServerSession(authOptions);
	const user = session?.user?.id;

	if (!user) return;

	const channel = `${user}__sending-message`;

	const content = e.get("content")?.toString().trimEnd();
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
			mention: mention
				? {
						connect: {
							id: mention.id,
						},
				  }
				: {},
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
			mention: {
				include: {
					author: true,
				},
			},
		},
	});

	await updatePercent(channel, 70);

	await newMessage(message);

	await updatePercent(channel, 100);
	await updatePercent(channel, 0);
}

export async function sendAudio(
	audioUrl: string,
	chatId: string,
	mention: _Message | null
) {
	const session = await getServerSession(authOptions);
	const user = session?.user?.id;

	if (!user) return;
	const channel = `${user}__sending-message`;
	await updatePercent(channel, 30);

	let message = await prisma.message.create({
		data: {
			content: "",
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
			mention: mention
				? {
						connect: {
							id: mention.id,
						},
				  }
				: {},
			chat: {
				connect: {
					id: chatId,
				},
			},
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
	});

	await updatePercent(channel, 70);

	await newMessage(message);

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

	await pusherServer.trigger(channel, event, { status, user });
}
