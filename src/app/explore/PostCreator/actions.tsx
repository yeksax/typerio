"use server";

import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function createPost(data: FormData) {
	const session = await getServerSession();

	if (data.get("content")!.length == 0) return;

	await prisma.post.create({
		data: {
			content: data.get("content")?.toString().trim() as string,
			author: {
				connect: {
					email: session?.user?.email as string,
				},
			},
		},
	});

	revalidatePath("/explore");
}
