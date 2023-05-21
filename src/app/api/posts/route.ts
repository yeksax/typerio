import { prisma } from "@/services/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const postsPerPage = 20;

export async function GET(req: NextApiRequest) {
	const { searchParams: query } = new URL(req.url as string);
	const page = query.get("page");

	if (!page)
		return NextResponse.json({
			error: "Bad request",
		});

	const session = await getServerSession(req);
	if (!session)
		return NextResponse.redirect(
			new URL("/api/auth/signin", req.url as string)
		);
	const posts = await prisma.post.findMany({
		skip: (Number(page) - 1) * postsPerPage,
		take: postsPerPage,
		include: {
			author: true,
			likedBy: {
				select: {
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return NextResponse.json(posts);
}
