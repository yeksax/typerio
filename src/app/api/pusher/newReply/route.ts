import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const { id, reply }: { id: string; reply: _Post } = await req.json();
	const user = reply.author;

	await pusherServer.trigger(`post-${id}`, "new-reply", reply);

	if (user.id !== reply.replied?.author.id) {
		await pusherServer.trigger(
			`user__${reply.replied!.author.id}__notifications`,
			"new-notification",
			null
		);

		await prisma.notification.create({
			data: {
				action: "REPLY",
				title: `${user.username} respondeu seu post!`,
				text: reply.content,
				notificationReceiver: {
					connect: {
						id: reply.replied!.author.id,
					},
				},
				notificationActors: {
					create: {
						users: {
							connect: {
								id: user.id,
							},
						},
					},
				},
			},
		});
	}
}
