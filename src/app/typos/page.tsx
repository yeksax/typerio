"use client";

import { useChat } from "@/hooks/ChatContext";
import Chat from "./ChatsSidebar/Chat";
import { useAtom } from "jotai";
import {
	fixedChatsAtom,
	mutedChatsAtom,
	unfixedChatsAtom,
	unmutedChatsAtom,
} from "@/atoms/appState";
import { isMobile } from "react-device-detect";
import { getRandomEmoji } from "@/utils/general/emoji";

export default function ChatsPage() {
	const chat = useChat();
	const [mutedChats, setMutedChats] = useAtom(mutedChatsAtom);
	const [unmutedChats, setUnmutedChats] = useAtom(unmutedChatsAtom);

	const [fixedChats, setFixedChats] = useAtom(fixedChatsAtom);
	const [unfixedChats, setUnfixedChats] = useAtom(unfixedChatsAtom);

	return isMobile ? (
		<div className='flex flex-col flex-1 pt-2'>
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
	) : (
		<div className="flex-1 h-full grid place-items-center text-[16rem]">
			{getRandomEmoji('Smileys & Emotion')}
		</div>
		);
}
