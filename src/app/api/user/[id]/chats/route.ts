import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
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
	if (!session) return NextResponse.json([], { status: 403 });

	const user = await prisma.user.findUnique({
		where: {
			id: session.user?.id,
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

	if (!user) return NextResponse.json([], { status: 403 });

	const history = user.chats;

	return NextResponse.json(
		{
			chats: history
				.filter((chat) => chat.messages.length > 0)
				.sort((a, b) => {
					if (a.messages.length > 0 && b.messages.length > 0) {
						if (
							a.messages.at(-1)!.createdAt.getTime() <
							b.messages.at(-1)!.createdAt.getTime()
						) {
							return 1;
						} else if (
							a.messages.at(-1)!.createdAt.getTime() >
							b.messages.at(-1)!.createdAt.getTime()
						) {
							return -1;
						} else {
							return 0;
						}
					}

					return -1;
				}),
			user: session.user!.id,
		},
		{ status: 200 }
	);
}
