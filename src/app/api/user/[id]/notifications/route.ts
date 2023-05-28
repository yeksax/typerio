import { prisma } from "@/services/prisma";
import { _Notification } from "@/types/interfaces";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	const { id: userID } = params;
	let notifications: _Notification[] = [];

	try {
		let userNotifications = await prisma.user.findUniqueOrThrow({
			where: {
				id: userID,
			},
			select: {
				notifications: {
					orderBy: {
						updatedAt: "desc",
					},
					include: {
						notificationActors: {
							include: {
								users: true,
							},
						},
					},
				},
			},
		});
		notifications = userNotifications.notifications;
	} catch {}

	return NextResponse.json(notifications);
}
