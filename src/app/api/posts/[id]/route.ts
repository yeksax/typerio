import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Post } from "@/types/interfaces";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, res: NextResponse) {
	const id = req.url.split("/").pop();

	const post: _Post | null = await prisma.post.findUnique({
		where: { id: id },
		include: {
			author: true,
			likedBy: true,
			thread: {
				orderBy: {
					createdAt: "asc",
				},
				include: {
					likedBy: true,
					author: true,
					_count: {
						select: {
							replies: true,
							likedBy: true,
						},
					},
				},
			},
			_count: {
				select: {
					replies: true,
					likedBy: true,
				},
			},
			replies: {
				where: {
					deleted: false,
				},
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

	return NextResponse.json(post?.deleted ? null : post);
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	await prisma.post.update({
		where: {
			id: params.id,
		},
		data: {
			deleted: true,
		},
	});

	await pusherServer.trigger("explore", "remove-post", params.id);

	return NextResponse.json({});
}
