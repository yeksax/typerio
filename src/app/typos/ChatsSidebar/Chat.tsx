"use client";

import { useChat } from "@/contexts/ChatContext";
import { _Chat, _ChatHistory } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/readableTime";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface Props {
	chat: _Chat;
	search: string;
}

export default function Chat({ chat, search }: Props) {
	const chatContext = useChat();
	const { data: session } = useSession();

	const unreadMessages = chat.messages.filter((msg) => {
		msg.readBy
			?.map((msgauthor) => msgauthor.id)
			.filter((msg) => msg.includes(session!.user!.id));
	}).length;

	const _lastMessage = chat.messages[chat.messages.length - 1];
	const lastMessage = {
		content: _lastMessage.content,
		author: _lastMessage.author.name,
		timestamp: _lastMessage.createdAt,
	};

	let chatName = chat.name;

	let dmReceiverAvatar: string | undefined;

	if (chat.type == "DIRECT_MESSAGE") {
		let target = chat.members.find((m) => m.id != session?.user?.id);
		chatName = target!.name;
		dmReceiverAvatar = target!.profilePicture;
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
				if (innerWidth < 1024) chatContext.setSidebarVisibility(false);
			}}
			href={`/typos/${chat.id}`}
			className='flex px-2 md:px-4 py-1 md:py-3 border-b last-of-type:border-b-2 border-black gap-2 md:gap-4 h-max overflow-hidden'
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
					<div className=' min-w-0'>
						<pre className='font-semibold truncate '>
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
					{lastMessage.timestamp && (
						<p className='opacity-60 text-xs'>
							{getHHmmTime(lastMessage.timestamp)}
						</p>
					)}
				</div>
				<div className='text-xs flex justify-between gap-1 items-center'>
					<pre className='truncate flex-1 w-0'>
						{lastMessage.author ? (
							<>
								<span className='font-semibold'>
									{lastMessage.author}:
								</span>{" "}
								{lastMessage.content}
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
