"use client";

import {
	fixedChatsAtom,
	mutedChatsAtom,
	unfixedChatsAtom,
	unmutedChatsAtom,
} from "@/atoms/appState";
import { useChat } from "@/hooks/ChatContext";
import { _Chat } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/client/readableTime";
import { removeAccents } from "@/utils/general/_stringCleaning";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FiBellOff, FiChevronDown, FiMic, FiStar } from "react-icons/fi";
import ChatActions from "./ChatActions";
import { isMobile } from "react-device-detect";
import { FaEllipsisH } from "react-icons/fa";
import { pusherClient } from "@/services/pusher";

interface Props {
	chat: _Chat;
	showTimestamp?: boolean;
	fullPage?: boolean;
}

export default function Chat({ chat, showTimestamp, fullPage }: Props) {
	const chatContext = useChat();
	const { data: session } = useSession();
	const _lastMessage = chat.messages[chat.messages.length - 1];
	const firstLoad = useRef(true);
	const [areActionsOpen, setActionsOpen] = useState(false);

	const [isSilenced, setSilenceState] = useState(
		chat.silencedBy?.length! > 0
	);
	const [status, setStatus] = useState<string | undefined>(undefined);
	const [mutedChats, setMutedChats] = useAtom(mutedChatsAtom);
	const [unmutedChats, setUnmutedChats] = useAtom(unmutedChatsAtom);

	const [isFixed, setFixedState] = useState(chat.fixedBy?.length! > 0);
	const [fixedChats, setFixedChats] = useAtom(fixedChatsAtom);
	const [unfixedChats, setUnfixedChats] = useAtom(unfixedChatsAtom);

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
						: _lastMessage.author.name.split(" ")[0],
				timestamp: _lastMessage.createdAt,
			});

			if (firstLoad.current) {
				setUnreadMessages((prev) => prev);
				firstLoad.current = false;
			} else {
				setUnreadMessages((prev) =>
					chatContext.currentChat?.id === chat.id ? prev : prev + 1
				);
			}
		}
	}, [_lastMessage]);

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

	let chatName = chat.name;

	let dmReceiverAvatar: string | undefined;
	let target: any;

	if (chat.type == "DIRECT_MESSAGE") {
		target = chat.members.find((m) => m.id != session?.user?.id);
		chatName = target!.name;
		dmReceiverAvatar = target!.avatar;
	}

	return (
		<Link
			onClick={() => {
				setUnreadMessages(0);
			}}
			href={
				target?.id
					? `/typos/${removeAccents(target.username)}`
					: `/typos/${chat.id}`
			}
			className={`${
				fullPage ? "px-4 md:px-8" : "px-3 md:px-4"
			} flex group py-2.5 md:py-3.5 transition-all duration-150 border-black gap-3 md:gap-4 h-max`}
			key={chat.id}
		>
			<Image
				className='md:w-9 md:h-9 w-11 h-11 rounded-md aspect-square border-2 border-black'
				src={dmReceiverAvatar || chat.thumbnail || "/placeholder.png"}
				alt='thumbnail'
				width={64}
				height={64}
			/>
			<div className='flex flex-col justify-between pb-0.5 w-full min-w-0'>
				<div className='text-base md:text-sm flex justify-between gap-1 items-center'>
					<div className='flex justify-between items-center w-full'>
						<div className='flex gap-2 min-w-0 items-center'>
							<pre className='font-semibold truncate break-all'>
								{chatName}
							</pre>

							{(isFixed || fixedChats.includes(chat.id)) &&
								!unfixedChats.includes(chat.id) && (
									<FiStar className='fill-black' size={12} />
								)}

							{(isSilenced || mutedChats.includes(chat.id)) &&
								!unmutedChats.includes(chat.id) && (
									<FiBellOff
										className=' text-gray-600'
										size={12}
									/>
								)}

							{unreadMessages > 0 && (
								<div className='w-4 h-4 bg-black rounded-full p-1 grid place-items-center'>
									<span
										style={{
											lineHeight: "1",
										}}
										className='text-xxs text-white'
									>
										{unreadMessages > 9
											? "9+"
											: unreadMessages}
									</span>
								</div>
							)}
						</div>
						<motion.div className='flex items-center gap-2 md:gap-3'>
							{showTimestamp && lastMessage?.timestamp && (
								<span className='text-sm text-gray-600'>
									{getHHmmTime(lastMessage.timestamp)}
								</span>
							)}
							<motion.div className='relative'>
								<div
									className='icon-hitbox relative group-hover:opacity-100 md:opacity-0 transition-all group-hover:translate-y-0 md:-translate-y-2'
									onClick={(e) => {
										e.preventDefault();
										setActionsOpen(!areActionsOpen);
									}}
								>
									<motion.div
										className=''
										animate={{
											rotate: areActionsOpen ? 180 : 0,
										}}
									>
										<FiChevronDown size={15} />
									</motion.div>
								</div>
								<AnimatePresence>
									{areActionsOpen && (
										<div
											onMouseLeave={() =>
												setActionsOpen(false)
											}
										>
											<ChatActions chat={chat} />
										</div>
									)}
								</AnimatePresence>
							</motion.div>
						</motion.div>
					</div>
				</div>
				<div className='text-sm md:text-xs flex justify-between gap-1 items-center'>
					{status ? (
						<pre className='truncate text-gray-600 flex-1 w-0 gap-1 flex justify-between'>
							{status}
						</pre>
					) : (
						<pre className='truncate flex-1 w-0 gap-1 flex justify-between'>
							{lastMessage ? (
								<>
									<div className='truncate text-gray-600'>
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
					)}
				</div>
			</div>
		</Link>
	);
}
