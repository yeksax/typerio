"use client";

import { useChat } from "@/contexts/ChatContext";
import { _Chat } from "@/types/interfaces";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

interface Props {
	chat: _Chat;
	session: Session;
}

export default function ChatHeader({ chat, session }: Props) {
	const { currentChat } = useChat();
	const isDM = chat.type === "DIRECT_MESSAGE";

	let thumbnail = chat.thumbnail;
	let title = chat.name;
	let [description, setDescription] = useState(chat.description);

	if (isDM) {
		let target = chat.members.find((m) => m.id != session!.user!.id);
		title = target!.name;
		thumbnail = target!.profilePicture;
		description = "offline";
	}

	return (
		<div className='border-b-2 border-b-black px-4 md:px-8 py-3 flex items-center z-1 bg-white justify-between w-full absolute'>
			<div className='flex gap-4'>
				<Image
					className='h-10 w-10 rounded-md border-2 border-black'
					src={thumbnail || "/avatar.png"}
					width={40}
					height={40}
					alt={title}
				/>
				<div className='flex flex-col justify-between w-full truncate'>
					<h1 className='text-base font-bold'>{title}</h1>
					<pre
						className={`text-xs truncate ${
							isDM
								? description == "offline"
									? "text-gray-500"
									: "text-black"
								: "font-semibold"
						}`}
					>
						{description}
					</pre>
				</div>
			</div>
		</div>
	);
}
