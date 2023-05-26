import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
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
					redirect: `/${post.author.username}/type/${post.id}`,
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

	if (author.notifications.length > 0) {
		// console.log(author.notifications[0])
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

		await prisma.notification.update({
			where: {
				id: author.notifications[0].id,
			},
			data: {
				isRead: false,
			},
		});
	} else {
		// console.log('ainda n existe a noti')
		await prisma.notification.create({
			data: {
				action: "LIKE",
				title: `$_0 seu post!`,
				text: post.content,
				redirect: `/${post.author.username}/type/${post.id}`,
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

	await pusherServer.trigger(
		`user__${post.author.id}__notifications`,
		"new-notification",
		null
	);

	return 200;
}
