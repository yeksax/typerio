"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { AnonymousPermissions, Preferences } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function allowPushNotifications(
	allow: boolean,
	subscription: any | undefined
) {
	const session = await getServerSession(authOptions);

	await prisma.user.update({
		where: {
			id: session?.user?.id,
		},
		data: {
			pushSubscription: subscription,
			preferences: {
				update: {
					allowPushNotifications: allow,
				},
			},
		},
	});
}

export async function setPreference(
	key: keyof Preferences,
	value: boolean | AnonymousPermissions
) {
	const session = await getServerSession(authOptions);

	const data: any = {};
	data[key] = value;

	await prisma.preferences.update({
		where: {
			userID: session?.user?.id,
		},
		data,
	});
}
