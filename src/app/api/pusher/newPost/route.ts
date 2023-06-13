import { pusherServer } from "@/services/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const { post } = await req.json();

	await pusherServer.trigger("explore", "new-post", post);
	await pusherServer.trigger(`user__${post.author.username}__post`, "new-post", post);
}
