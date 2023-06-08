import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Notification } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	let { id: userID } = params;
	let notifications: _Notification[] = [];

	if (userID == "me") {
		const session = await getServerSession(authOptions);
		if (!session?.user) return null;
		userID = session.user.id;
	}

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
