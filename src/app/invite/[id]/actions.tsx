"use server";

import { prisma } from "@/services/prisma";
import { _Chat, _ChatHistory } from "@/types/interfaces";

async function getNewChat(chat: _Chat, userID: string): Promise<_ChatHistory> {
	let dmReceiver: string | undefined;
	let dmReceiverAvatar: string | undefined;

	if (chat.type == "DIRECT_MESSAGE") {
		let target = chat.members.find((m) => m.id != userID);
		dmReceiver = target!.name;
		dmReceiverAvatar = target!.avatar;
	}

	return {
		id: chat.id,
		name: dmReceiver || chat.name,
		type: chat.type,
		memberCount: chat._count!.members,
		description: chat.description,
		thumbnail: dmReceiverAvatar || chat.thumbnail,
		lastMessage: {
			content: chat.messages[chat.messages.length - 1]?.content,
			timestamp: chat.messages[chat.messages.length - 1]?.createdAt,
			author: chat.messages[chat.messages.length - 1]?.author.name,
		},
		unreadMessages: chat.messages.filter(
			(message) => !message.readBy?.some((readBy) => readBy.id === userID)
		).length,
		messages: chat.messages,
	};
}

export async function joinGroup(groupID: string, userID: string) {
	const chat: _Chat = await prisma.chat.update({
		where: {
			id: groupID,
		},
		data: {
			members: {
				connect: {
					id: userID,
				},
			},
		},
		include: {
			_count: {
				select: {
					members: true,
				},
			},
			members: true,
			messages: {
				orderBy: {
					createdAt: "asc",
				},
				include: {
					mention: {
						include: {
							author: true,
						},
					},
					author: true,
					readBy: {
						select: {
							id: true,
						},
					},
				},
			},
			fixedBy: {
				select: {
					id: true,
				},
			},
		},
	});

	return chat

	// redirect(`/typos/${groupID}`);
}
