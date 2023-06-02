"use client";

import { useChat, useChat as useMessages } from "@/contexts/ChatContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
	FiArrowLeft,
	FiChevronLeft,
	FiSearch,
	FiUserPlus,
	FiUsers,
} from "react-icons/fi";
import Chat from "./Chat";
import { motion } from "framer-motion";

interface Props {}

export default function ChatSidebar({}: Props) {
	const chat = useChat();
	const { chatHistory } = chat;

	const [chatSearch, setChatSearch] = useState("");
	const [userSearch, setUserSearch] = useState("");

	return (
		<>
			<motion.div
				animate={{
					width: chat.isSidebarVisible ? "max-content" : "0px",
					borderRightWidth: chat.isSidebarVisible ? "2px" : "0",
				}}
				transition={{
					ease: "easeInOut",
					duration: 0.2,
				}}
				className={`h-full border-r-2 border-black overflow-hidden absolute lg:relative flex-col w-max bg-white z-20`}
			>
				<div className='flex flex-col relative h-full w-max'>
					<div className='flex items-center px-2 md:px-4 text-sm h-12 border-b-2 border-black justify-between'>
						Mensagens
						<FiChevronLeft
							size={20}
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

						<div className='px-2 md:px-4 text-sm flex gap-4 justify-between'>
							<div className='hover:bg-black hover:text-white transition-all cursor-pointer flex gap-2 px-2 py-0.5 md:px-4 md:py-1 rounded-md border-2 border-black items-center'>
								<FiUserPlus />
								Nova Conversa
							</div>
							<div className='hover:bg-black hover:text-white transition-all cursor-pointer flex gap-2 px-2 py-0.5 md:px-4 md:py-1 rounded-md border-2 border-black items-center'>
								<FiUsers />
								Novo Grupo
							</div>
						</div>
					</div>
					<div className='flex flex-col border-b h-full overflow-y-auto overflow-x-hidden border-scroll'>
						{chatHistory
							.filter((chat) =>
								chat.name.toLowerCase().includes(chatSearch)
							)
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
				className='fixed block lg:hidden top-0 left-0 z-10 w-full h-full bg-black/50 backdrop-blur-sm'
				onClick={()=>{
					chat.setSidebarVisibility(false)
				}}
				animate={{
					pointerEvents: chat.isSidebarVisible ? "all" : "none",
					opacity: chat.isSidebarVisible ? 1 : 0,
				}}
			></motion.div>
		</>
	);
}
