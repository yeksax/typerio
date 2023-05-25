import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { NextRequest, NextResponse } from "next/server";

const postsPerPage = 20;

export async function GET(req: NextRequest, res: NextResponse) {
	const { searchParams: query } = new URL(req.url as string);
	const page = query.get("page");

	if (!page)
		return NextResponse.json({
			error: "Bad request",
		});

	const posts: _Post[] = await prisma.post.findMany({
		skip: (Number(page) - 1) * postsPerPage,
		take: postsPerPage,
		where: {
			replied: null,
			deleted: false,
		},
		include: {
			author: true,
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

	return NextResponse.json(posts);
}
