import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { NextRequest, NextResponse } from "next/server";
import {
	newNotification,
	newPushNotification,
} from "../../../util/userNotifications";

export async function POST(req: NextRequest, res: NextResponse) {
	const { id, reply }: { id: string; reply: _Post } = await req.json();
	const user = reply.author;

	await pusherServer.trigger(`post-${id}`, "new-reply", reply);

	if (user.id !== reply.replied?.author.id) {
		const notification = await prisma.notification.create({
			include: {
				notificationActors: {
					include: {
						users: true,
					},
				},
			},
			data: {
				action: "REPLY",
				//$_n representa placeholders que serão rescritos
				icon: reply.author?.avatar,
				title: `$_0 ${
					reply.repliedId ? "seu comentário" : "seu post"
				}!`,
				text: reply.content,
				redirect: `${removeAccents(reply.author.username)}/type/${
					reply.id
				}`,
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

		await newNotification(reply.replied!.author.id, notification);
		await newPushNotification({
			userID: reply.replied!.author.id,
			scope: "allowReplyNotifications",
			notification: {
				action: "REPLY",
				notificationActors: notification.notificationActors,
				redirect: notification.redirect,
				text: notification.text,
				title: notification.title,
				icon: notification.icon,
			},
		});
	}
}
