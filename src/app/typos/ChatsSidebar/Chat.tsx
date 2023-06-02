"use client";

import { useChat } from "@/contexts/ChatContext";
import { _ChatHistory } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/readableTime";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface Props {
	chat: _ChatHistory;
	search: string;
}

export default function Chat({ chat, search }: Props) {
	const chatContext = useChat();
	const { data: session } = useSession();

	const { currentChat } = chatContext;
	const { unreadMessages, lastMessage } = chat;
	let chatName = chat.name;

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
			onClick={()=>chatContext.setSidebarVisibility(false)}
			href={`/typos/${chat.id}`}
			className='flex px-2 md:px-4 py-1 md:py-3 border-b last-of-type:border-b-2 border-black gap-2 md:gap-4 h-max'
			key={chat.id}
		>
			<Image
				className='w-10 h-10 rounded-md aspect-square border-2 border-black'
				src={chat.thumbnail || "/placeholder.png"}
				alt='thumbnail'
				width={64}
				height={64}
			/>
			<div className='flex flex-col justify-between pb-0.5 w-full'>
				<div className='text-sm flex justify-between w-full gap-1 items-center'>
					<div className='flex gap-2 items-center'>
						<pre className='font-semibold flex'>
							{preMatchStr}
							{MatchStr && (
								<h3 className='font-bold'>{MatchStr}</h3>
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
					{chat.lastMessage.timestamp && (
						<p className='opacity-60'>
							{getHHmmTime(chat.lastMessage.timestamp)}
						</p>
					)}
				</div>
				<div className='text-xs flex justify-between w-full gap-1 items-center'>
					<p className='line-clamp-1 flex-1'>
						{chat.lastMessage.author ? (
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
					</p>
				</div>
			</div>
		</Link>
	);
}
