"use client";

import { FiSend } from "react-icons/fi";
import MessageInput from "./MessageInput";
import { sendMessage } from "./actions";
import { Session } from "next-auth";
import PostLoading from "@/components/PostLoading";

interface Props {
	session: Session;
  chatId: string
}

export default function MessageForm({ session, chatId }: Props) {
	return (
		<form
			className='relative px-8 pb-4 pt-2 flex items-center'
			action={async (e) => {
				await sendMessage(e, session.user!.id, chatId);
			}}
		>
			<div className='border-black rounded-md border-2 py-2 px-4 w-full h-fit flex gap-4 relative'>
				<MessageInput />
				<button type='submit'>
					<FiSend size={20} className='cursor-pointer' />
				</button>
				<PostLoading position="bottom" listener="sending-message"/>
			</div>
		</form>
	);
}
