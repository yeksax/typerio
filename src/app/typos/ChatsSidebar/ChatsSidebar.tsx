"use client";

import { useChat, useChat as useMessages } from "@/contexts/ChatContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	FiArrowLeft,
	FiChevronLeft,
	FiSearch,
	FiUserPlus,
	FiUsers,
} from "react-icons/fi";
import Chat from "./Chat";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface Props {}

export default function ChatSidebar({}: Props) {
	const chat = useChat();
	const { chatHistory } = chat;
	const { data: session } = useSession();
	const [clientWidth, setClientWidth] = useState(0);

	useEffect(()=>{
		setClientWidth(window.innerWidth)
	}, [])

	const [chatSearch, setChatSearch] = useState("");

	return (
		<>
			<motion.div
				initial={{
					width: chat.isSidebarVisible
						? clientWidth > 1024
							? "30%"
							: "320px"
						: "0px",
					borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
				}}
				animate={{
					width: chat.isSidebarVisible
						? clientWidth > 1024
							? "30%"
							: "320px"
						: "0px",
					borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
				}}
				transition={{
					ease: "easeInOut",
					duration: 0.15,
				}}
				className={`h-full border-r-2 border-black overflow-hidden absolute lg:relative flex-col bg-white z-20`}
			>
				<div className='flex flex-col relative h-full w-full'>
					<div className='flex items-center px-2 md:px-4 text-sm h-12 border-b-2 border-black justify-between'>
						Mensagens
						<FiChevronLeft
							size={20}
							className="cursor-pointer"
							onClick={() => chat.setSidebarVisibility(false)}
						/>
					</div>
					<div className='flex flex-col gap-4 border-b-2 border-black pb-3'>
						<div className='relative w-full'>
							<input
								type='text'
								className='text-sm w-full outline-none px-2 md:px-4 py-3'
								placeholder='Procurar por uma conversa...'
								onChange={(e) =>
									setChatSearch(e.target.value.toLowerCase())
								}
							/>
							<FiSearch
								size={20}
								className='absolute right-4 top-1/2 -translate-y-1/2'
							/>
						</div>
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
			</motion.div>
			<motion.div
				className='fixed block lg:hidden top-0 left-0 z-10 w-full h-full bg-black/50'
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
