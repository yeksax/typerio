"use server";

import {
	newNotification,
	newPushNotification,
	removeNotification,
} from "@/utils/server/userNotifications";
import { prisma } from "@/services/prisma";
import {
	removeAccents,
	removeBadCharacteres,
	removeEmojis,
} from "@/utils/general/string";
import { Prisma } from "@prisma/client";
import { Session } from "next-auth";

export async function followUser(target: string, user: string) {
	const targetInfo = await prisma.user.update({
		where: {
			id: target,
		},
		data: {
			followers: {
				connect: {
					id: user,
				},
			},
		},
	});

	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			id: user,
		},
	});

	const notification = await prisma.notification.create({
		data: {
			redirect: `/${userInfo.username}`,
			title: `${userInfo.name} te seguiu`,
			text: "",
			action: "FOLLOW",
			icon: userInfo.avatar,
			notificationReceiver: {
				connect: {
					id: target,
				},
			},
			notificationActors: {
				create: {
					users: {
						connect: {
							id: userInfo.id,
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

export async function unfollowUser(target: string, user: string) {
	const userInfo = await prisma.user.update({
		where: {
			id: user,
		},
		data: {
			followers: {
				disconnect: {
					id: user,
				},
			},
		},
	});

	let notification = await prisma.notification.findFirstOrThrow({
		where: {
			redirect: `/${userInfo.username}`,
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

export async function editProfile(data: {
	name: string;
	username: string;
	tag: string;
	bio: string;
	urls: string[];
	session: Session | null;
}): Promise<
	| "username_taken"
	| "error"
	| "not_allowed"
	| {
			name: string;
			username: string;
			tag: string;
			biography: string;
			links: Prisma.JsonValue;
	  }
> {
	const { session } = data;

	if (!session) {
		return "error";
	}

	let user = await prisma.user.findUnique({
		where: {
			username: data.username,
		},
	});

	if (!user) {
		return "error";
	}

	if (session.user?.id === user.id) {
		let username = `${removeAccents(
			removeBadCharacteres(
				removeEmojis(data.name.toLowerCase().replace(/\s/g, "-"))
			)
		)}_${data.tag}`;

		const updatedUser = await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				name: data.name,
				username: username,
				biography: data.bio,
				tag: data.tag,
				links: data.urls,
			},
			select: {
				name: true,
				username: true,
				biography: true,
				tag: true,
				links: true,
			},
		});

		return updatedUser;
	}

	return "not_allowed";
}

export async function uploadAvatar(
	url: string,
	userID: string,
	session: Session | null
) {
	if (!session) {
		return "error";
	}

	const user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
	});

	if (!user) {
		return "error";
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userID,
		},
		data: {
			avatar: url,
		},
	});

	return updatedUser;
}

export async function uploadBanner(
	url: string,
	userID: string,
	session: Session | null
) {
	if (!session) {
		return "error";
	}

	const user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
	});

	if (!user) {
		return "error";
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userID,
		},
		data: {
			banner: url,
		},
	});

	return updatedUser;
}
