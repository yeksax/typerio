import { prisma } from "@/services/prisma";
import { _Chat, _Notification } from "@/types/interfaces";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	const { id: userID } = params;
	let Chats: _Chat[] = [];

	

	return NextResponse.json(null);
}
