import { newNotification } from "@/app/api/util/userNotifications";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	let { user, target }: { user: string | User; target: string } =
		await req.json();

	user = await prisma.user.findUniqueOrThrow({
		where: {
			id: user as string,
		},
	});

	const notification = await prisma.notification.create({
		data: {
			redirect: `/${user.username}`,
			title: `${user.name} te seguiu`,
			text: "",
			action: "FOLLOW",
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
}
