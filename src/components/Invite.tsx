"use client";

import { useChat } from "@/hooks/ChatContext";
import { _Invite } from "@/types/interfaces";
import Image from "next/image";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";

interface Props {
	invite: _Invite;
}

export default function ChatInvite({ invite }: Props) {
	const chatContext = useChat();

	const isInChat = !!chatContext.chatHistory.find(
		(c) => c.id === invite.chat.id
	);

	return (
		<Link
			href={
				isInChat ? `/typos/${invite.chatId}` : `/invite/${invite.code}`
			}
			className='flex items-center gap-2 mt-4 md:gap-4 py-1.5 px-4 border-2 border-black rounded-md w-full'
		>
			<Image
				className='rounded-md border-black border-2 w-11 h-11'
				src={invite.chat.thumbnail}
				alt={invite.chat.name}
				width={64}
				height={64}
			/>
			<div className='flex flex-col justify-between w-full text-xs'>
				<div className='flex flex-col w-full'>
					<div className='flex w-full gap-2'>
						<span className='font-semibold text-sm w-full gap-4 line-clamp-1 items-center break-all'>
							{invite.chat.name}
						</span>
						<div className='flex gap-2 items-center'>
							{invite.chat._count.members}
							<FiUsers size={14} />
						</div>
					</div>
					<h4 className='text-gray-600 line-clamp-2 break-all'>
						{invite.owner?.name} está te convidando para o grupo{" "}
						{invite.chat.name}
					</h4>
				</div>
				
			</div>
		</Link>
	);
}
