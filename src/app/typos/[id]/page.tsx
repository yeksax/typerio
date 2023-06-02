import Message from "@/components/Message/Message";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Chat, _Message } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { FiSend } from "react-icons/fi";
import MessagesContainer from "./MessagesContainer";
import { sendMessage } from "./actions";
import MessageForm from "./MessageForm";
import ChatHeader from "./ChatHeader";
import { Metadata, ResolvingMetadata } from "next";

interface Props {
	params: {
		id: string;
	};
}

export async function generateMetadata(
	{ params }: Props,
 ): Promise<Metadata> {
	// read route params
	const chat = await prisma.chat.findUniqueOrThrow({
		where: {
			id: params.id,
		},
		select: {
			name: true,
		},
	});

	return {
		title: chat.name != "" ? chat.name : "Chat",
	};
}

export default async function ChatPage({ params }: Props) {
	const session = await getServerSession(authOptions);

	const chat: _Chat | null = await prisma.chat.findUnique({
		where: {
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

	if (!chat) return <>chat inexistente pae 👋</>;

	await prisma.user.update({
		where: {
			id: session!.user!.id,
		},
		data: {
			messagesRead: {
				connect: chat.messages.map((msg: any) => ({
					id: msg.id,
				})),
			},
		},
	});

	return (
		<div className='flex flex-col flex-1 relative '>
			<ChatHeader chat={chat} session={session!} />

			<MessagesContainer session={session!} chat={chat} />

			<MessageForm session={session!} chatId={chat.id} />
		</div>
	);
}