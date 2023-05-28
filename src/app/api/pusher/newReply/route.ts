import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { NextRequest, NextResponse } from "next/server";
import { updateUserNotifications } from "../../util/updateUserNotifications";

export async function POST(req: NextRequest, res: NextResponse) {
	const { id, reply }: { id: string; reply: _Post } = await req.json();
	const user = reply.author;

	await pusherServer.trigger(`post-${id}`, "new-reply", reply);

	if (user.id !== reply.replied?.author.id) {
		const notification = await prisma.notification.create({
			data: {
				action: "REPLY",
				//$_n representa placeholders que serão rescritos
				title: `$_0 ${
					reply.repliedId ? "seu comentário" : "seu post"
				}!`,
				text: reply.content,
				redirect: `${reply.author.username}/type/${reply.id}`,
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

		await updateUserNotifications(reply.replied!.author.id);
	}
}
