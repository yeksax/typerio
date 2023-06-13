import { pusherServer } from "@/services/pusher";
import { _Chat } from "@/types/interfaces";
import { NextResponse } from "next/server";

export async function POST(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	const body: _Chat = await req.json();

	body.members.forEach(async (member) => {
		await pusherServer.trigger(
			`user__${member.id}__chats`,
			"new-chat",
			body
		);
	});

	return NextResponse.json(body)
}
