import { updateUserNotifications } from "@/app/api/util/updateUserNotifications";
import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Notification } from "@/types/interfaces";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const { user, post: postId } = await req.json();

	const post = await prisma.post.update({
		where: {
			id: postId,
		},
		data: {
			likedBy: {
				connect: {
					id: user,
				},
			},
		},
		include: {
			author: true,
		},
	});

	const authorId = post.author.id;

	if (user == authorId) return 200

	const author = await prisma.user.findUniqueOrThrow({
		where: {
			id: authorId,
		},
		select: {
			notifications: {
				where: {
					action: "LIKE",
					redirect: `/${removeAccents(post.author.username)}/type/${post.id}`,
				},
				include: {
					notificationActors: {
						select: {
							id: true,
						},
					},
				},
			},
		},
	});

	let notification: _Notification;

	if (author.notifications.length > 0) {
		await prisma.notificationActors.update({
			where: {
				notificationId: author.notifications[0].id,
			},
			data: {
				users: {
					connect: {
						id: user,
					},
				},
			},
		});

		notification = await prisma.notification.update({
			where: {
				id: author.notifications[0].id,
			},
			data: {
				isRead: false,
			},
		});
	} else {
		notification = await prisma.notification.create({
			data: {
				action: "LIKE",
				title: `$_0 ${post.repliedId ? "seu comentário" : "seu post"}!`,
				text: post.content,
				redirect: `/${removeAccents(post.author.username)}/type/${post.id}`,
				notificationReceiver: {
					connect: {
						id: authorId,
					},
				},
				notificationActors: {
					create: {
						users: {
							connect: {
								id: user,
							},
						},
					},
				},
			},
		});
	}

	await updateUserNotifications(authorId);

	return NextResponse.json({ status: "success" });
}
