"use client";

import {
	fixedChatsAtom,
	mutedChatsAtom,
	unfixedChatsAtom,
	unmutedChatsAtom,
} from "@/atoms/appState";
import { useChat } from "@/hooks/ChatContext";
import { getRandomEmoji } from "@/utils/general/emoji";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Chat from "./ChatsSidebar/Chat";

export default function ChatsContainer() {
	const chat = useChat();

	const [emoji, setEmoji] = useState("🤗");

	useEffect(() => {
		setEmoji(getRandomEmoji("Smileys & Emotion"));
	}, []);

	const [mutedChats, setMutedChats] = useAtom(mutedChatsAtom);
	const [unmutedChats, setUnmutedChats] = useAtom(unmutedChatsAtom);

	const [fixedChats, setFixedChats] = useAtom(fixedChatsAtom);
	const [unfixedChats, setUnfixedChats] = useAtom(unfixedChatsAtom);

	return (
		<>
			<div className='flex lg:hidden flex-col flex-1'>
				{chat.chatHistory
					.sort((a, b) => {
						if (
							a.fixedBy?.length! > b.fixedBy?.length! ||
							fixedChats.includes(a.id)
						) {
							return -1;
						} else if (
							a.fixedBy?.length! < b.fixedBy?.length! ||
							(fixedChats.includes(b.id) &&
								!fixedChats.includes(a.id))
						) {
							return 1;
						}

						return 0;
					})
					.map((chat) => (
						<Chat fullPage chat={chat} key={chat.id} />
					))}
			</div>
			<div className='flex-1 h-full hidden lg:grid pointer-events-none select-none place-items-center text-[16rem]'>
				{emoji}
			</div>
		</>
	);
}
