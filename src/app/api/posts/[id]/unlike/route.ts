import {
	removeNotification,
	updateNotification
} from "@/app/api/util/userNotifications";
import { prisma } from "@/services/prisma";
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
				disconnect: {
					id: user,
				},
			},
		},
		include: {
			author: true,
		},
	});

	const author = await prisma.user.findUniqueOrThrow({
		where: {
			id: post.author.id,
		},
		select: {
			notifications: {
				where: {
					action: "LIKE",
					redirect: `/${removeAccents(post.author.username)}/type/${
						post.id
					}`,
				},
				include: {
					notificationActors: {
						select: {
							id: true,
							_count: {
								select: {
									users: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (author.notifications[0].notificationActors?._count.users === 1) {
		// era o unico like

		await prisma.notificationActors.delete({
			where: {
				notificationId: author.notifications[0].id,
			},
		});

		const notification = await prisma.notification.delete({
			where: {
				id: author.notifications[0].id,
			},
		});

		await removeNotification(post.author.id, notification);
	} else {
		const notification = await prisma.notification.update({
			where: {
				id: author.notifications[0].id,
			},
			include: {
				notificationActors: {
					include: {
						users: true,
					},
				},
			},
			data: {
				notificationActors: {
					update: {
						users: {
							disconnect: {
								id: user,
							},
						},
					},
				},
			},
		});

		await updateNotification(post.author.id, notification);
	}

	return NextResponse.json({ status: "success" });
}
