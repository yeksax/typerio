import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import webPush from "@/services/webPush";
import { _Notification } from "@/types/interfaces";
import { NotificationAction, Preferences, User } from "@prisma/client";
import { paramReplacing } from "./notificationParser";

export async function newPushNotification({
	scope,
	notification,
	userID,
}: {
	scope: keyof Preferences;
	notification: {
		notificationActors:
			| {
					users: User[];
			  }
			| null
			| undefined;
		action: NotificationAction | "DIRECT_MESSAGE";
		title: string;
		text: string;
		redirect: string;
		icon: string | null;
	};
	userID: string;
}) {
	const user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		include: {
			preferences: true,
		},
	});

	if (!user) return;
	if (!user.preferences?.allowPushNotifications) return;
	if (!user.preferences[scope]) return;

	const notificationActors = notification.notificationActors?.users.map(
		(user) => user.name
	);

	let actors = "";
	let enumAction = notification.action;
	let singleAction = "";
	let pluralAction = "";

	if (enumAction === "FOLLOW") {
		singleAction = "seguiu";
		pluralAction = "seguiram";
	}
	if (enumAction === "LIKE") {
		singleAction = "curtiu";
		pluralAction = "curtiram";
	}
	if (enumAction === "REPLY") {
		singleAction = "respondeu";
		pluralAction = "responderam";
	}

	if (notificationActors) {
		if (notificationActors.length > 1)
			actors = notificationActors[0] + ` e outros ${pluralAction} `;
		else actors = notificationActors[0] + ` ${singleAction} `;
	}

	webPush.sendNotification(
		user.pushSubscription,
		JSON.stringify({
			title: paramReplacing(notification.title, [actors]),
			message: notification.text,
			icon: notification.icon,
			data: {
				url: notification.redirect,
			},
		})
	);
}

export async function newNotification(
	target: string,
	notification: _Notification
) {
	await pusherServer.trigger(
		`user__${target}__notifications`,
		"new-notification",
		notification
	);
}

export async function removeNotification(
	target: string,
	notification: _Notification
) {
	await pusherServer.trigger(
		`user__${target}__notifications`,
		"remove-notification",
		notification.id
	);
}

export async function updateNotification(
	target: string,
	notification: _Notification
) {
	await pusherServer.trigger(
		`user__${target}__notifications`,
		"update-notification",
		notification.id
	);
}
