"use client";

import { useChat, useChat as useMessages } from "@/contexts/ChatContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiSearch, FiUserPlus, FiUsers } from "react-icons/fi";
import Chat from "./Chat";

interface Props {}

export default function ChatList({}: Props) {
	const chat = useChat();
	const { chatHistory } = chat;

	const [chatSearch, setChatSearch] = useState("");
	const [userSearch, setUserSearch] = useState("");

	return (
		<div className='h-full border-r-2 border-black flex flex-col w-1/3'>
			<div className='flex items-center px-2 md:px-4 text-sm h-12 border-b-2 border-black justify-between'>
				Solicitações de Mensagem
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

				<div className='px-2 md:px-4 text-sm flex justify-between'>
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
			<div className='flex flex-col border-b h-full overflow-y-auto border-scroll'>
				{chatHistory
					.filter((chat) =>
						chat.name.toLowerCase().includes(chatSearch)
					)
					.map((chat) => (
						<Chat chat={chat} search={chatSearch} key={chat.id} />
					))}
			</div>
		</div>
	);
}
