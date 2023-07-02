import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	let user = await prisma.user.findUnique({
		where: {
			id: session.user.id!,
		},
		include: {
			preferences: true,
			following: true,
			followers: true,
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

	if (!user?.preferences) {
		user = await prisma.user.update({
			where: {
				id: session.user.id,
			},
			data: {
				preferences: {
					create: {},
				},
			},
			include: {
				preferences: true,
				following: true,
				followers: true,
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
	}

	return NextResponse.json(user);
}
