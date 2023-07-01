"use client";

import { useChat } from "@/hooks/ChatContext";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FiChevronLeft, FiLoader, FiSearch } from "react-icons/fi";
import Chat from "./Chat";

interface Props {}

export default function ChatSidebar({}: Props) {
	const chat = useChat();
	const { chatHistory, isLoading } = chat;
	const { data: session } = useSession();
	const [chatSearch, setChatSearch] = useState("");

	return (
		<>
			<motion.div
				initial={{
					width: chat.isSidebarVisible ? "320px" : "0px",
					borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
				}}
				animate={{
					width: chat.isSidebarVisible ? "320px" : "0px",
					borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
				}}
				transition={{
					ease: "easeInOut",
					duration: 0.15,
				}}
				className={`h-full border-r-2 border-black overflow-hidden absolute lg:relative flex-col bg-white z-20`}
			>
				{isLoading ? (
					<div className='w-full h-full grid place-items-center'>
						<FiLoader className='animate-spin' size={24} />
					</div>
				) : (
					<div className='flex flex-col relative h-full w-full'>
						<div className='flex items-center px-2 md:px-4 text-sm h-12 border-b-2 border-black justify-between'>
							Mensagens
							<FiChevronLeft
								size={20}
								className='cursor-pointer'
								onClick={() => chat.setSidebarVisibility(false)}
							/>
						</div>
						<div className='flex flex-col gap-0.5 border-b h-full overflow-y-auto overflow-x-hidden border-scroll'>
							{chatHistory
								.filter((chat) => {
									let searchMatches = chat.name
										.toLowerCase()
										.includes(chatSearch);

									let dmReceiverAvatar: string | undefined;

									if (chat.type == "DIRECT_MESSAGE") {
										let target = chat.members.find(
											(m) => m.id != session?.user?.id
										);
										searchMatches = target!.name
											.toLowerCase()
											.includes(chatSearch);
									}

									return searchMatches;
								})
								.map((chat) => (
									<Chat
										chat={chat}
										search={chatSearch}
										key={chat.id}
									/>
								))}
						</div>
					</div>
				)}
			</motion.div>
			<motion.div
				className='fixed lg:hidden top-0 left-0 z-10 w-full h-full bg-black/50'
				onClick={() => {
					chat.setSidebarVisibility(false);
				}}
				initial={{
					pointerEvents: chat.isSidebarVisible ? "all" : "none",
					opacity: chat.isSidebarVisible ? 1 : 0,
				}}
				animate={{
					pointerEvents: chat.isSidebarVisible ? "all" : "none",
					opacity: chat.isSidebarVisible ? 1 : 0,
				}}
			></motion.div>
		</>
	);
}
