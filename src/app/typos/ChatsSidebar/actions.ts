"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";

export async function pinChatManager(id: string, value: boolean) {
	const session = await getServerSession(authOptions);

	if (!session) return;
	if (!session.user) return;

	await prisma.user.update({
		where: {
			id: session.user.id,
		},
		data: value
			? {
					fixedChats: {
						connect: {
							id,
						},
					},
			  }
			: {
					fixedChats: {
						disconnect: {
							id,
						},
					},
			  },
	});
}

export async function muteChatManager(id: string, value: boolean) {
	const session = await getServerSession(authOptions);

	if (!session) return;
	if (!session.user) return;

	await prisma.user.update({
		where: {
			id: session.user.id,
		},
		data: value
			? {
					silencedChats: {
						connect: {
							id,
						},
					},
			  }
			: {
					silencedChats: {
						disconnect: {
							id,
						},
					},
			  },
	});
}
