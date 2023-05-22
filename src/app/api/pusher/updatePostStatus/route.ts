import { pusherServer } from "@/services/pusher";
import { channel } from "diagnostics_channel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const {percent, channel}: { percent: number; channel: string } = await req.json();

	await pusherServer.trigger(channel, "progress", percent);
}