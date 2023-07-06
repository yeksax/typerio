"use server";

import { prisma } from "@/services/prisma";
import {
	removeAccents,
	removeBadCharacteres,
	removeEmojis,
} from "../general/_stringCleaning";

export async function createUser(
	name: string,
	email: string,
	avatar: string | undefined
) {
	const tag = String(Math.floor(Math.random() * 9999)).padStart(4, "0");

	try {
		const user = await prisma.user.create({
			data: {
				email: email,
				tag: tag,
				name: name,
				username: `${removeAccents(
					removeBadCharacteres(
						removeEmojis(name.toLowerCase().replace(/\s/g, "-"))
					)
				)}_${tag}`,
				avatar: avatar,
				preferences: {
					create: {},
				},
			},
		});

		return user;
	} catch {
		return null;
	}
}
