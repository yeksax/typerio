"use client";

import { useChat } from "@/hooks/ChatContext";
import { _Chat, _ChatHistory } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/client/readableTime";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FiMic } from "react-icons/fi";

interface Props {
	chat: _Chat;
	search: string;
}

export default function Chat({ chat, search }: Props) {
	const chatContext = useChat();
	const { data: session } = useSession();
	const _lastMessage = chat.messages[chat.messages.length - 1];
	const firstLoad = useRef(true)

	let [unreadMessages, setUnreadMessages] = useState(0);
	let [lastMessage, setLastMessage] = useState<{
		content: string | ReactNode;
		author: string;
		timestamp: Date;
	} | null>(null);

	useEffect(() => {
		if (!session) return;
		if (!session.user) return;

		setUnreadMessages(
			chat.messages.filter((msg) => {
				let readers = msg.readBy?.map((u) => u.id);

				return !readers?.includes(session.user!.id);
			}).length
		);
	}, [chat]);

	useEffect(() => {
		if (_lastMessage !== undefined) {
			let content: string | ReactNode = _lastMessage.content;

			if (_lastMessage.audio) {
				content = (
					<span className='flex items-center gap-2'>
						<FiMic /> Audio
					</span>
				);
			}

			setLastMessage({
				content,
				author:
					_lastMessage.author.id == session?.user!.id
						? "eu"
						: _lastMessage.author.name,
				timestamp: _lastMessage.createdAt,
			});

			if(firstLoad.current){
				setUnreadMessages(prev => prev);
				firstLoad.current = false
			} else {
				setUnreadMessages((prev) => chatContext.currentChat?.id === chat.id ? prev : prev + 1)
			}
		}
	}, [_lastMessage]);

	let chatName = chat.name;

	let dmReceiverAvatar: string | undefined;
	let target: any;

	if (chat.type == "DIRECT_MESSAGE") {
		target = chat.members.find((m) => m.id != session?.user?.id);
		chatName = target!.name;
		dmReceiverAvatar = target!.avatar;
	}

	let preMatchStr = chatName;
	let MatchStr = undefined;
	let postMatchStr = undefined;

	if (search) {
		let searchLower = search.toLowerCase();
		let nameLower = chatName.toLowerCase();

		let formattedStr = "";
		let searchInNameIdx = nameLower.indexOf(searchLower);
		preMatchStr = chatName.substring(0, searchInNameIdx);
		MatchStr = `${chatName.substring(
			searchInNameIdx,
			searchInNameIdx + searchLower.length
		)}`;
		postMatchStr = chatName.substring(searchInNameIdx + searchLower.length);

		chatName = formattedStr;
	}

	return (
		<Link
			onClick={() => {
				setUnreadMessages(0)
				if (innerWidth < 1024) chatContext.setSidebarVisibility(false);
			}}
			href={
				target?.id
					? `/typos/${removeAccents(target.username)}`
					: `/typos/${chat.id}`
			}
			className='flex px-2 md:px-4 py-2.5 md:py-3 transition-all duration-150 border-black gap-2 md:gap-4 h-max'
			key={chat.id}
		>
			<Image
				className='w-10 h-10 rounded-md aspect-square border-2 border-black'
				src={dmReceiverAvatar || chat.thumbnail || "/placeholder.png"}
				alt='thumbnail'
				width={64}
				height={64}
			/>
			<div className='flex flex-col justify-between pb-0.5 w-full min-w-0'>
				<div className='text-sm flex justify-between gap-1 items-center'>
					<div className='flex gap-2 min-w-0'>
						<pre className='font-semibold truncate break-all'>
							{preMatchStr}
							{MatchStr && (
								<span className='font-bold'>{MatchStr}</span>
							)}
							{postMatchStr}
						</pre>
						{unreadMessages > 0 && (
							<div className='w-5 h-5 bg-black rounded-full p-1 relative grid place-items-center'>
								<span
									style={{
										lineHeight: "1",
									}}
									className='text-xs text-white relative top-1/2 -translate-y-1/2'
								>
									{unreadMessages > 9 ? "9+" : unreadMessages}
								</span>
							</div>
						)}
					</div>
				</div>
				<div className='text-xs flex justify-between gap-1 items-center'>
					<pre className='truncate flex-1 w-0 gap-1 flex justify-between'>
						{lastMessage ? (
							<>
								<div className='truncate'>
									{lastMessage.content}
								</div>
								<span className='font-semibold text-gray-700'>
									~{lastMessage.author}
								</span>
							</>
						) : (
							<span className='font-normal text-gray-500 italic'>
								Sem mensagens ainda...
							</span>
						)}
					</pre>
				</div>
			</div>
		</Link>
	);
}
