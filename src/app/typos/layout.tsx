import Sidebar from "@/components/Sidebar/Sidebar";
import MessagesProvider from "@/contexts/ChatContext";
import ChatList from "./ChatsSidebar/ChatsSidebar";
import { prisma } from "@/services/prisma";
import ChatProvider from "@/contexts/ChatContext";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { _ChatHistory } from "@/types/interfaces";

export default async function ChatsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: session?.user?.id,
		},
		select: {
			chats: {
				select: {
					name: true,
					id: true,
					description: true,
					type: true,
					thumbnail: true,
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

	const history: _ChatHistory[] = user.chats.map((chat) => {
		let dmReceiver: string | undefined;
		let dmReceiverAvatar: string | undefined;

		if (chat.type == "DIRECT_MESSAGE") {
			let target = chat.members.find((m) => m.id != session!.user!.id);
			dmReceiver = target!.name;
			dmReceiverAvatar = target!.profilePicture;
		}

		return {
			id: chat.id,
			name: dmReceiver || chat.name,
			type: chat.type,
			description: chat.description,
			thumbnail: dmReceiverAvatar || chat.thumbnail,
			lastMessage: {
				content: chat.messages[chat.messages.length-1]?.content,
				timestamp: chat.messages[chat.messages.length-1]?.createdAt,
				author: chat.messages[chat.messages.length-1]?.author.name,
			},
			unreadMessages: chat.messages.filter(
				(message) =>
					!message.readBy.some(
						(readBy) => readBy.id === session?.user?.id
					)
			).length,
			messages: chat.messages,
		};
	});

	return (
		<section className='flex h-full overflow-hidden'>
			{/* @ts-ignore */}
			<Sidebar forceCollapse />
			<main className='h-full w-full flex'>
				<ChatProvider history={history}>
					<ChatList />
					{children}
				</ChatProvider>
			</main>
		</section>
	);
}
