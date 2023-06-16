import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Notification } from "@/types/interfaces";

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
