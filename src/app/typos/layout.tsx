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
					type: true,
					thumbnail: true,
					messages: {
						orderBy: {
							createdAt: "desc",
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

	let dmReceiver = ''

	const history: _ChatHistory[] = user.chats.map((chat) => ({
		id: chat.id,
		name: chat.name,
		type: chat.type,
		thumbnail: dmReceiver || chat.thumbnail,
		lastMessage: {
			content: chat.messages[0]?.content,
			timestamp: chat.messages[0]?.createdAt,
			author: chat.messages[0]?.author.name,
		},
		unreadMessages: chat.messages.filter(
			(message) =>
				!message.readBy.some(
					(readBy) => readBy.id === session?.user?.id
				)
		).length,
		messages: chat.messages.reverse(),
	}));

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
