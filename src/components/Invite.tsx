"use client";

import { useChat } from "@/contexts/ChatContext";
import { _Invite } from "@/types/interfaces";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
		<div className='flex gap-2 mt-4 md:gap-4 py-1 px-2 border-2 border-black rounded-md'>
			<Image
				className='rounded-md border-black border-2 w-11 h-11'
				src={invite.chat.thumbnail}
				alt={invite.chat.name}
				width={64}
				height={64}
			/>
			<div className='flex flex-col justify-between w-full text-xs'>
				<div className='flex flex-col w-full'>
					<h3 className='font-semibold text-sm w-full flex gap-4 items-center line-clamp-1 break-all'>
						{invite.chat.name}
						<div className='flex gap-2 items-center'>
							{invite.chat._count.members}
							<FiUsers size={14} />
						</div>
					</h3>
					<h4 className='text-gray-600 line-clamp-1 break-all'>
						{invite.owner?.name} está te convidando para o grupo{" "}
						{invite.chat.name}
					</h4>
				</div>
				<div className='flex mt-2 justify-end'>
					<Link
						aria-disabled={!!isInChat}
						className='bg-black text-white hover:text-black hover:font-semibold hover:bg-white border-2 border-black transition-colors px-2 py-0.5 rounded-md'
						href={isInChat ? `/typos/${invite.chatId}` : `/invite/${invite.code}`}
					>
						{isInChat ? "Continuar" : "Aceitar convite"}
					</Link>
				</div>
			</div>
		</div>
	);
}
