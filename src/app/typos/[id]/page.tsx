import Message from "@/components/Message/Message";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Message } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import Image from "next/image";
import MessageInput from "./MessageInput";
import { FiSend } from "react-icons/fi";
import MessagesContainer from "./MessagesContainer";
import { sendMessage } from "./actions";
import MessageForm from "./MessageForm";

interface Props {
	params: {
		id: string;
	};
}

export default async function ChatPage({ params }: Props) {
	const session = await getServerSession(authOptions);

	const chat = await prisma.chat.findUnique({
		where: {
			id: params.id,
		},
		include: {
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

	if(!chat) return <>chat inexistente pae 👋</>

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
		<div className='flex flex-col flex-1'>
			<div className='border-b-2 border-b-black px-8 py-4 flex items-center justify-between w-full'>
				<div className='flex gap-4'>
					<Image
						className='h-11 w-11 rounded-md border-2 border-black'
						src={chat.thumbnail}
						width={40}
						height={40}
						alt={chat.name}
					/>
					<div className='flex flex-col justify-between'>
						<h1 className='text-lg font-bold'>{chat.name}</h1>
						<pre className='text-xs font-semibold'>
							{chat.description}
						</pre>
					</div>
				</div>
			</div>

			<MessagesContainer
				session={session!}
				chat={chat}
			/>

			<MessageForm session={session!} chatId={chat.id} />
		</div>
	);
}
