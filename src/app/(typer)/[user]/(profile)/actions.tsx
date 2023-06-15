"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { uploadFiles } from "@/services/uploadthing";
import { _Post } from "@/types/interfaces";
import {
	removeAccents,
	removeBadCharacteres,
	removeEmojis,
} from "@/utils/general/_stringCleaning";
import { dataURItoBlob } from "@/utils/general/files";
import { Prisma, User } from "@prisma/client";
import { Session, getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

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

	revalidatePath(`/${removeAccents(userInfo.username)}`);
	revalidatePath(`/${user}`);
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

	revalidatePath(`/${removeAccents(userInfo.username)}`);
	revalidatePath(`/${user}`);
}

const postsPerPage = 20;

export async function getProfilePosts(
	page: number,
	owner: string,
	session: Session | null
): Promise<_Post[]> {
	const posts = await prisma.post.findMany({
		skip: (page - 1) * postsPerPage,
		take: postsPerPage,
		where: {
			replied: null,
			deleted: false,
			AND: {
				author:
					owner == "me" && session
						? { id: session?.user?.id }
						: { username: owner },
			},
		},
		include: {
			invite: {
				include: {
					owner: true,
					chat: {
						include: {
							_count: {
								select: {
									members: true,
								},
							},
						},
					},
				},
			},
			author: session?.user?.id
				? {
						include: {
							followers: {
								where: {
									id: session.user.id,
								},
							},
						},
				  }
				: true,
			likedBy: {
				select: {
					id: true,
				},
			},
			_count: {
				select: {
					replies: true,
					likedBy: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return posts;
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
		// if(data.avatar){
		// 	let file = dataURItoBlob(data.avatar?.file)
		// }

		// if(data.banner){
		// 	let file = dataURItoBlob(data.banner?.file)
		// }

		let username = `${removeAccents(
			removeBadCharacteres(
				removeEmojis(data.name.toLowerCase().replace(/\s/g, "-"))
			)
		)}_${data.tag}`;

		let json = data.urls as Prisma.JsonArray;

		const updatedUser = await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				name: data.name,
				username: username,
				biography: data.bio,
				tag: data.tag,
				links: json,
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

export async function uploadAvatar(url: string, userID: string, session: Session | null) {
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

export async function uploadBanner(url: string, userID: string, session: Session | null) {
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