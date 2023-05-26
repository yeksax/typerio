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
						},
					},
				},
			},
		},
	});

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

	return 200;
}
