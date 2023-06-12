"use server";

import { prisma } from "@/services/prisma";
import { revalidatePath } from "next/cache";

export async function followUser(target: string, user: string) {
	await prisma.user.update({
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

	revalidatePath(`/${target}`)
	revalidatePath(`/${user}`)
}

export async function unfollowUser(target: string, user: string) {
	await prisma.user.update({
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

	revalidatePath(`/${target}`)
	revalidatePath(`/${user}`)
}
