import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _ChatHistory, _Notification } from "@/types/interfaces";
import { parseChatHistory } from "@/utils/server/historyParser";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: { id: string };
	}
) {
	const session = await getServerSession(authOptions);

	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: session?.user?.id,
		},
		select: {
			chats: {
				include: {
					_count: {
						select: {
							members: true,
						},
					},
					members: true,
					messages: {
						orderBy: {
							createdAt: "asc",
						},
						include: {
							mention: {
								include: {
									author: true,
								},
							},
							author: true,
							readBy: {
								select: {
									id: true,
								},
							},
						},
					},
					fixedBy: {
						select: {
							id: true,
						},
					},
				},
			},
		},
	});

	const history = user.chats
	// const history: _ChatHistory[] = parseChatHistory(user.chats, session!.user!.id)

	return NextResponse.json(
		history.sort((a, b) => {
			if (
				a.messages[a.messages.length - 1].createdAt <
				b.messages[b.messages.length - 1].createdAt
			) {
				return 1;
			} else {
				return -1;
			}
		})
	);
}
