import { pusherServer } from "@/services/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const { id } = await req.json();

	await pusherServer.trigger(`post-${id}`, "new-reply", null);
}
