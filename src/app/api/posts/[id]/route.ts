import { prisma } from "@/services/prisma";
import { _Post } from "@/types/interfaces";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
	const id = req.url.split("/").pop();

	const post: _Post | null = await prisma.post.findUnique({
		where: { id: id },
		include: {
			author: true,
			likedBy: true,
			_count: {
				select: {
					replies: true,
          likedBy: true
				},
			},
			replies: {
				include: {
					author: true,
					likedBy: true,
					_count: {
						select: {
							replies: true,
							likedBy: true,
						},
					},
				},
			},
		},
	});

	return NextResponse.json(post);
}
