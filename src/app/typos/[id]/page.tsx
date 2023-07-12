import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Chat } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import ChatContainer from "./ChatContainer";
import { Metadata } from "next";
import { pusherServer } from "@/services/pusher";

interface Props {
	params: {
		id: string;
	};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const target = await prisma.user.findUnique({
		where: {
			username: params.id,
		},
		select: {
			name: true,
		},
	});

	if (target) {
		return {
			title: `Typo com ${target.name}`,
		};
	}

	let chat = await prisma.chat.findFirst({
		where: {
			id: params.id,
		},
		select: {
			name: true,
		},
	});

	return {
		title: chat?.name || "Typo não encontrado :(",
	};
}

export default async function ChatPage({ params }: Props) {
	const session = await getServerSession(authOptions);
	if (!session) return <>log in pae</>;

	const target = await prisma.user.findUnique({
		where: {
			username: params.id,
		},
	});

	let chat: _Chat | null = await prisma.chat.findFirst({
		where: target
			? {
					members: {
						some: {
							username: params.id,
						},
					},
					AND: {
						members: {
							some: {
								id: session?.user!.id,
							},
						},
						type: "DIRECT_MESSAGE",
					},
			  }
			: {
					id: params.id,
			  },
		include: {
			members: true,
			messages: {
				orderBy: {
					createdAt: "asc",
				},
				include: {
					author: true,
					mention: {
						include: {
							author: true,
						},
					},
				},
			},
		},
	});

	if (!chat && !!target) {
		chat = await prisma.chat.create({
			data: {
				type: "DIRECT_MESSAGE",
				description: "",
				name: "",
				members: {
					connect: [{ id: session?.user!.id }, { id: target.id }],
				},
			},
			include: {
				members: true,
				messages: {
					orderBy: {
						createdAt: "asc",
					},
					include: {
						author: true,
						mention: {
							include: {
								author: true,
							},
						},
					},
				},
			},
		});

		chat.members.forEach(async (member) => {
			await pusherServer.trigger(
				`user__${member.id}__chats`,
				"new-chat",
				chat
			);
		});
	} else if (!chat) {
		return (
			<div className='flex-1 h-full grid place-items-center'>
				Chat inexistente 😰
			</div>
		);
	} else {
		await prisma.user.update({
			where: {
				id: session?.user!.id,
			},
			data: {
				messagesRead: {
					connect: chat.messages.map((msg: any) => ({
						id: msg.id,
					})),
				},
			},
		});
	}

	return (
		<>
			<ChatContainer chat={chat!} session={session!} />
		</>
	);
}
