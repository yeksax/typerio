import { pusherServer } from "@/services/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const { user } = await req.json();

	await pusherServer.trigger(
		`user__${user}__notifications`,
		"clear-notifications",
		null
	);
}
