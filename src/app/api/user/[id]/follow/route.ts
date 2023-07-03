import {
	newNotification,
	newPushNotification,
} from "@/app/api/util/userNotifications";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	let { user: userID, target }: { user: string; target: string } =
		await req.json();

	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userID,
		},
	});

	const notification = await prisma.notification.create({
		data: {
			redirect: `/${user.username}`,
			title: `${user.name} te seguiu`,
			text: "",
			action: "FOLLOW",
			icon: user.avatar,
			notificationReceiver: {
				connect: {
					id: target,
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
		include: {
			notificationActors: {
				include: {
					users: true,
				},
			},
		},
	});

	await newNotification(target, notification);
	await newPushNotification({
		userID: target,
		scope: "allowFollowNotifications",
		notification: {
			action: "FOLLOW",
			notificationActors: notification.notificationActors,
			redirect: notification.redirect,
			text: notification.text,
			title: notification.title,
			icon: notification.icon,
		},
	});
}
