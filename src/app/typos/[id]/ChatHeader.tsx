"use client";

import { useChat } from "@/hooks/ChatContext";
import { _Chat } from "@/types/interfaces";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
	chat: _Chat;
	session: Session;
}

export default function ChatHeader({ chat, session }: Props) {
	const chatContext = useChat();
	let description = chat.description;

	if (!chat) return <>carregando...</>;

	const isDM = chat.type === "DIRECT_MESSAGE";

	let thumbnail = chat.thumbnail;
	let title = chat.name;

	if (isDM) {
		let target = chat.members.find((m) => m.id != session!.user!.id);
		title = target!.name;
		thumbnail = target!.avatar;
		description = "offline";
	}

	return (
		<div className='absolute border-b-2 border-b-black px-4 md:px-8 py-3 flex items-center gap-4 z-1 bg-white justify-between w-full overflow-hidden'>
			<Image
				className='h-10 w-10 rounded-md border-2 border-black'
				src={thumbnail || "/avatar.png"}
				width={40}
				height={40}
				alt={title}
			/>
			<div className='truncate w-full flex min-w-0 flex-col overflow-hidden'>
				<span className='text-base min-w-0 truncate font-bold'>
					{title}
				</span>
				<span className={`text-xs min-w-0 truncate`}>
					{description}
				</span>
			</div>
		</div>
	);
}
