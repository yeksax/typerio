"use client";

import { _Invite } from "@/types/interfaces";
import Image from "next/image";
import { joinGroup } from "./actions";
import { Session } from "next-auth";
import { useChat } from "@/contexts/ChatContext";
import { redirect } from "next/navigation";

interface Props {
	invite: _Invite;
  session: Session
}

export default function JoinForm({ invite, session }: Props) {
	const chatContext = useChat()

	return (
		<form
			action={async (e) => {
				let newChat = await joinGroup(invite.chat.id, session.user!.id);
				chatContext.appendNewChat(newChat)
				redirect("/typos/" + invite.chat.id)
			}}
			className='p-8 px-16 border-4 border-black rounded-lg fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-4'
		>
			<Image
				className='rounded-lg w-28 h-28 object-cover border-4 border-black'
				src={invite.chat.thumbnail}
				width={256}
				height={256}
				alt='thumbnail'
			/>
			<h3 className='text-md font-medium text-center w-80'>
				Quer entrar no grupo{" "}
				<span className='font-semibold'>{invite.chat.name}</span>?
			</h3>
			<button
				type='submit'
				className='px-8 py-1 flex gap-4 items-center font-semibold border-2 border-black hover:bg-black hover:text-white rounded-md text-black bg-white transition-colors'
			>
				Confirmar
			</button>
		</form>
	);
}
