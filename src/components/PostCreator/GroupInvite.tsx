"use client";
import { _Chat, _ChatHistory } from "@/types/interfaces";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";
import Image from "next/image";
import { useChat } from "@/hooks/ChatContext";

interface Props {
	visible?: boolean;
	setInvite: any;
	setInviteCode: any;
	setInviteCreation: any;
}

const validCharacteres =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function GroupAction({
	visible,
	setInvite,
	setInviteCode,
	setInviteCreation,
}: Props) {
	const [chats, setChats] = useState<_Chat[]>([]);
	const [search, setSearch] = useState("");
	const chatContext = useChat();

	function generateCode() {
		let str = "";
		for (let i = 0; i < 8; i++) {
			str +=
				validCharacteres[
					Math.floor(Math.random() * validCharacteres.length)
				];
		}

		return str;
	}

	useEffect(() => {
		setChats(
			chatContext.chatHistory.filter((chat) => chat.type === "GROUP_CHAT")
		);
	}, [chatContext.chatHistory]);

	return (
		<motion.div
			className='absolute z-10 w-full max-sm:left-0 max-sm:flex max-sm:justify-center'
			onHoverEnd={() => setInviteCreation(false)}
			initial={{
				opacity: 0,
				pointerEvents: "none",
				y: 0,
			}}
			animate={{
				pointerEvents: visible ? "auto" : "none",
				opacity: visible ? 1 : 0,
				y: visible ? 15 : 0,
			}}
		>
			<ul className='flex flex-col max-w-xs bg-white border-2 border-black rounded-md'>
				<div className='relative px-4 my-1.5'>
					<input
						type='text'
						onChange={(e) => setSearch(e.target.value)}
						placeholder='Procurar...'
						className=' border-2 border-black rounded-md w-full text-sm px-3 py-1'
					/>
					<FiSearch
						size={12}
						className='absolute right-6 top-1/2 -translate-y-1/2'
					/>
				</div>
				{chats
					.filter((chat) => chat.name.toLowerCase().includes(search))
					.map((chat) => (
						<li
							onClick={() => {
								setInvite(chat);
								setInviteCode(generateCode());
								setInviteCreation(false);
							}}
							className='flex cursor-pointer gap-4 py-2 border-b-2 last-of-type:border-b-0 px-4 border-black justify-between items-center hover:bg-black hover:text-white'
							key={chat.id}
						>
							<Image
								className='rounded-md border-2 border-black'
								src={chat.thumbnail}
								width={32}
								height={32}
								alt={chat.name}
							/>
							<div className='flex flex-col overflow-hidden flex-1'>
								<div className='flex w-full justify-between gap-2'>
									<span className='text-sm font-semibold truncate'>
										{chat.name}
									</span>
									<span className='text-sm flex gap-1 items-center'>
										{chat._count?.members}
										<FiUsers size={12} />
									</span>
								</div>
								<span className='text-xs w-full truncate'>
									{chat.description}
								</span>
							</div>
							<FiPlus size={16} />
						</li>
					))}
			</ul>
		</motion.div>
	);
}
