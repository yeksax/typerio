import { pusherServer } from "@/services/pusher";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const { post } = await req.json();

	await pusherServer.trigger("explore", "new-post", post);
	await pusherServer.trigger(`user__${removeAccents(post.author.username)}__post`, "new-post", post);
}
