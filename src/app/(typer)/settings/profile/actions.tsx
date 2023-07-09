"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _User } from "@/types/interfaces";
import {
	removeAccents,
	removeBadCharacteres,
	removeEmojis,
} from "@/utils/general/string";
import { getServerSession } from "next-auth";

export async function updateProfile({
	e,
	avatarURL,
	bannerURL,
}: {
	e: FormData;
	avatarURL: string;
	bannerURL: string;
}) {
	const session = await getServerSession(authOptions);

	const links = e.getAll("link") as string[];
	const displayName = e.get("displayName") as string;
	const description = e.get("description") as string;
	let name = e.get("name") as string;
	let tag = e.get("tag") as string;

	name = removeAccents(
		removeBadCharacteres(
			removeEmojis(
				name
					.toLowerCase()
					.trim()
					.replace(/\s/g, "-")
			)
		)
	)

	tag = removeAccents(
		removeBadCharacteres(
			removeEmojis(
				tag
					.toLowerCase()
					.trim()
					.replace(/\s/g, "0")
			)
		)
	)

	if (!session) return;
	if (!session.user) return;

	const user: _User = await prisma.user.update({
		where: {
			id: session.user.id,
		},
		data: {
			username: `${name}_${tag}`,
			name: name.trim(),
			links: links.map((link) => link.trim()),
			displayName: displayName != "" ? displayName.trim() : null,
			tag: tag,
			biography: description.trim(),
			banner: bannerURL,
			avatar: avatarURL,
		},
		include: {
			_count: {
				select: {
					chats: true,
					posts: true,
					likedPosts: true,
					following: true,
					followers: true,
				},
			},
		},
	});

	return user;
}
