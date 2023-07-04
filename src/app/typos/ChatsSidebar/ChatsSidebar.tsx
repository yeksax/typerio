"use client";

import { useChat } from "@/hooks/ChatContext";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FiChevronLeft, FiLoader } from "react-icons/fi";
import Chat from "./Chat";
import {
	fixedChatsAtom,
	mutedChatsAtom,
	unfixedChatsAtom,
	unmutedChatsAtom,
} from "@/atoms/appState";
import { useAtom } from "jotai";
import { usePathname } from "next/navigation";

interface Props {}

export default function ChatSidebar({}: Props) {
	const chat = useChat();
	const { chatHistory, isLoading, currentChat } = chat;
	const [mutedChats, setMutedChats] = useAtom(mutedChatsAtom);
	const [unmutedChats, setUnmutedChats] = useAtom(unmutedChatsAtom);

	const [fixedChats, setFixedChats] = useAtom(fixedChatsAtom);
	const [unfixedChats, setUnfixedChats] = useAtom(unfixedChatsAtom);

	const currentPath = usePathname();

	return (
		<motion.div
			initial={{
				width: chat.isSidebarVisible ? "29%" : "0px",
				borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
			}}
			animate={{
				width: chat.isSidebarVisible ? "29%" : "0px",
				borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
			}}
			transition={{
				ease: "easeInOut",
				duration: 0.15,
			}}
			className={`h-full lg:flex hidden border-r-2 border-black overflow-hidden flex-col bg-white z-20`}
		>
			{isLoading ? (
				<div className='w-full h-full grid place-items-center'>
					<FiLoader className='animate-spin' size={24} />
				</div>
			) : (
				<div className='flex flex-col border-b h-full overflow-y-auto overflow-x-hidden border-scroll'>
					{chatHistory
						.sort((a, b) => {
							if (
								a.fixedBy?.length! > b.fixedBy?.length! ||
								(fixedChats.includes(a.id) &&
									!fixedChats.includes(b.id))
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
						.filter(
							(chat) =>
								chat.messages.length > 0 ||
								currentChat?.id === chat.id ||
								currentPath === "/typos" ||
								chat.fixedBy?.length! > 0 ||
								fixedChats.includes(chat.id)
						)
						.map((chat) => (
							<Chat chat={chat} key={chat.id} />
						))}
				</div>
			)}
		</motion.div>
	);
}
