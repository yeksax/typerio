import { updateUserNotifications } from "@/app/api/util/updateUserNotifications";
import { prisma } from "@/services/prisma";
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
					redirect: `/${post.author.username}/type/${post.id}`,
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

		await prisma.notification.delete({
			where: {
				id: author.notifications[0].id,
			},
		});
	} else {
		await prisma.notificationActors.update({
			where: {
				notificationId: author.notifications[0].id,
			},
			data: {
				users: {
					disconnect: {
						id: user,
					},
				},
			},
		});
	}

	await updateUserNotifications(post.author.id)

	return 200;
}
