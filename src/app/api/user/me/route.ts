import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	const user = await prisma.user.findUnique({
		where: {
			id: session.user.id!,
		},
		include: {
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

	return NextResponse.json(user);
}
