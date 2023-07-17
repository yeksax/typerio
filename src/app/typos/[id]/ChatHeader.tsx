"use client";

import { useChat } from "@/hooks/ChatContext";
import { pusherClient } from "@/services/pusher";
import { _Chat } from "@/types/interfaces";
import { Session } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { User } from "@prisma/client";

interface Props {
	chat: _Chat;
	session: Session;
}

export default function ChatHeader({ chat, session }: Props) {
	let description = chat.description;
	const router = useRouter();
	const [status, setStatus] = useState<string | undefined>(undefined);
	const chatContext = useChat();
	const [isDragging, setIsDragging] = useState(false);

	const isDM = chat.type === "DIRECT_MESSAGE";

	let thumbnail = chat.thumbnail;
	let title = chat.name;
	let target: User | undefined;

	if (isDM) {
		target = chat.members.find((m) => m.id != session!.user!.id);
		title = target!.name;
		thumbnail = target!.avatar;
		description = "offline";
	}

	useEffect(() => {
		let channelStr = `chat__${chat.id}__status`;
		let channel = pusherClient.channel(channelStr);

		if (!channel) {
			channel = pusherClient.subscribe(channelStr);
		}

		channel.bind(
			"update-status",
			(data: { status: string | undefined; user: string }) => {
				if (data.user != session?.user?.id) setStatus(data.status);
			}
		);

		return () => {
			channel.unbind("update-status");
		};
	}, [chat, chatContext.currentChat]);

	return (
		<div className='absolute top-4 px-6 pl-4 md:px-10 w-full flex items-center justify-between'>
			<motion.div
				drag
				onDragStart={() => setIsDragging(true)}
				onDragEnd={() => setIsDragging(false)}
				dragMomentum={false}
				dragSnapToOrigin
				className='z-10'
			>
				<FiChevronLeft
					size={18}
					className='lg:hidden border-2 border-l-4 dark:bg-zinc-900 dark:border-zinc-950 bg-white border-b-4 rounded-md border-black cursor-pointer min-w-[1rem] p-2 box-content'
					onPointerUp={() => {
						if (!isDragging) router.back();
					}}
				/>
			</motion.div>
			<motion.div
				drag
				onDragStart={() => setIsDragging(true)}
				onDragEnd={() => setIsDragging(false)}
				onPointerUp={() => {
					if (!isDragging && target)
						router.push(`/${target.username}`);
				}}
				dragMomentum={false}
				dragSnapToOrigin
				className='right-4 dark:bg-zinc-900 dark:border-zinc-950 cursor-pointer md:right-8 border-r-4 max-w-[65%] border-b-4 pl-4 pr-2 w-max md:pl-6 md:pr-3 py-2 min-w-0 flex items-center gap-4 z-10 bg-white justify-between border-2 border-black rounded-md overflow-hidden'
			>
				<div className='truncate w-full flex items-end min-w-0 flex-col overflow-hidden'>
					<span className='text-sm truncate font-bold'>{title}</span>
					<span className={`text-xs truncate`}>
						{status ? status : description}
					</span>
				</div>
				<Image
					className='h-9 w-9 aspect-square rounded-md border-2 bg-white border-black'
					src={thumbnail || "/avatar.png"}
					width={40}
					height={40}
					alt={title}
				/>
			</motion.div>
		</div>
	);
}
