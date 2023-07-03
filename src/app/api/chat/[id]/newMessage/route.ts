import { newPushNotification } from "@/app/api/util/userNotifications";
import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Message } from "@/types/interfaces";
import { NextResponse } from "next/server";

export async function POST(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	const { id } = params;
	const { message }: { message: _Message } = await req.json();

	await pusherServer.trigger(`chat__${id}`, "new-message", message);

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
					redirect: "/",
					text: !!message.audio ? "Audio" : message.content,
					title: `${message.author.name} enviou uma mensagem`,
					icon: message.author.avatar,
				},
			});
	}

	return NextResponse.json({ status: "ok" });
}
