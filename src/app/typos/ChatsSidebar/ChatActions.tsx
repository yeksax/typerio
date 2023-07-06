import {
	fixedChatsAtom,
	mutedChatsAtom,
	unfixedChatsAtom,
	unmutedChatsAtom,
} from "@/atoms/appState";
import { _Chat } from "@/types/interfaces";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useState } from "react";
import { FiBell, FiBellOff } from "react-icons/fi";
import { TbStar, TbStarOff } from "react-icons/tb";
import { muteChatManager, pinChatManager } from "./actions";

interface Props {
	chat: _Chat;
}

export default function ChatActions({ chat }: Props) {
	const [isSilenced, setSilenceState] = useState(
		chat.silencedBy?.length! > 0
	);
	const [mutedChats, setMutedChats] = useAtom(mutedChatsAtom);
	const [unmutedChats, setUnmutedChats] = useAtom(unmutedChatsAtom);

	const [isFixed, setFixedState] = useState(chat.fixedBy?.length! > 0);
	const [fixedChats, setFixedChats] = useAtom(fixedChatsAtom);
	const [unfixedChats, setUnfixedChats] = useAtom(unfixedChatsAtom);

	async function pinManager() {
		setFixedChats((prev) => [...prev, chat.id]);
		setUnfixedChats((prev) => prev.filter((c) => c != chat.id));
		await pinChatManager(chat.id, true);
	}

	async function unpin() {
		setUnfixedChats((prev) => [...prev, chat.id]);
		setFixedChats((prev) => prev.filter((c) => c != chat.id));
		await pinChatManager(chat.id, false);
	}

	async function mute() {
		setMutedChats((prev) => [...prev, chat.id]);
		setUnmutedChats((prev) => prev.filter((c) => c != chat.id));
		await muteChatManager(chat.id, true);
	}

	async function unmute() {
		setUnmutedChats((prev) => [...prev, chat.id]);
		setMutedChats((prev) => prev.filter((c) => c != chat.id));
		await muteChatManager(chat.id, false);
	}

	const defaultActionStyle = "flex gap-2 items-center py-2 hover:font-semibold transition-all w-full";
  
	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 12,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			exit={{
				opacity: 0,
				y: 12,
			}}
      onClick={(e)=>e.preventDefault()}
			className='flex text-xs flex-col right-0 rounded-md w-max z-30 absolute dark:bg-zinc-800 bg-white px-2 md:px-3 border-2 border-black dark:border-zinc-950'
		>
			<div className='flex gap-2 items-center cursor-pointer'>
				{(isFixed || fixedChats.includes(chat.id)) &&
				!unfixedChats.includes(chat.id) ? (
					<button onClick={unpin} className={`${defaultActionStyle}`}>
						<TbStarOff /> Desfixar conversa
					</button>
				) : (
					<button
						onClick={pinManager}
						className={`${defaultActionStyle}`}
					>
						<TbStar /> Fixar conversa
					</button>
				)}
			</div>

			<div className='group/bell cursor-pointer'>
				{(isSilenced || mutedChats.includes(chat.id)) &&
				!unmutedChats.includes(chat.id) ? (
					<button
						onClick={unmute}
						className={`${defaultActionStyle}`}
					>
						<FiBell className='group-hover/bell:animate-ring' />{" "}
						Reativar Notificações
					</button>
				) : (
					<button
						onClick={mute}
						className={`${defaultActionStyle} text-red-500`}
					>
						<FiBellOff /> Desativar Notificações
					</button>
				)}{" "}
			</div>
		</motion.div>
	);
}
