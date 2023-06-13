import { pusherServer } from "@/services/pusher";
import { _Message } from "@/types/interfaces";
import { NextResponse } from "next/server";

export async function POST(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	const { id } = params;
	const { message }: { message: _Message } = await req.json();

	await pusherServer.trigger(`chat__${id}`, "new-message", message);

	return NextResponse.json({status: "ok"})
}
