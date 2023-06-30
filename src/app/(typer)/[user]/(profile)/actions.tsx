"use server";

import { prisma } from "@/services/prisma";
import {
	removeAccents,
	removeBadCharacteres,
	removeEmojis,
} from "@/utils/general/_stringCleaning";
import { Prisma } from "@prisma/client";
import { Session } from "next-auth";

export async function followUser(target: string, user: string) {
	const userInfo = await prisma.user.update({
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

	await fetch(process.env.PAGE_URL! + `/api/user/${target}/follow`, {
		method: "POST",
		body: JSON.stringify({
			target,
			user,
		}),
		cache: "no-store",
	});
}

export async function unfollowUser(target: string, user: string) {
	const userInfo = await prisma.user.update({
		where: {
			id: target,
		},
		data: {
			followers: {
				disconnect: {
					id: user,
				},
			},
		},
	});

	await fetch(process.env.PAGE_URL! + `/api/user/${target}/unfollow`, {
		method: "POST",
		body: JSON.stringify({
			target,
			user,
		}),
		cache: "no-store",
	});
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
