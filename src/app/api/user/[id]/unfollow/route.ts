import {
	newNotification,
	removeNotification,
} from "@/app/api/util/userNotifications";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	let { user, target }: { user: string | User; target: string } =
		await req.json();

	user = await prisma.user.findUniqueOrThrow({
		where: {
			id: user as string
		}
	})

	let notification = await prisma.notification.findFirstOrThrow({
		where: {
			redirect: `/${user.username}`,
			receiverId: target,
		},
	});

	await prisma.notificationActors.delete({
		where: {
			notificationId: notification.id,
		},
	});

	notification = await prisma.notification.delete({
		where: {
			id: notification.id,
		},
	});

	await removeNotification(target, notification);
}
