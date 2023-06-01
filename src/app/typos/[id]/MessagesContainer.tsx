"use client";

import Message from "@/components/Message/Message";
import { useChat } from "@/contexts/ChatContext";
import { pusherClient } from "@/services/pusher";
import { _Chat, _Message } from "@/types/interfaces";
import { Session } from "next-auth";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
	session: Session;
	chat: _Chat;
}

export default function MessagesContainer({ session, chat }: Props) {
	const chatContext = useChat();

	function groupMessages(msgs: _Message[]): _Message[][] {
		let groupedMessages: any[] = [[]];
		if (msgs.length > 0) {
			let lastAuthor = msgs[0].authorId;

			msgs.forEach((msg: any) => {
				if (msg.authorId == lastAuthor) {
					groupedMessages[groupedMessages.length - 1].push(msg);
				} else {
					lastAuthor = msg.authorId;
					groupedMessages.push([msg]);
				}
			});

			return groupedMessages;
		}

		return [[]];
	}

	useEffect(() => {
		chatContext.setCurrentChat(chat);

		let channel = `chat__${chat.id}`;

		pusherClient.unsubscribe(channel);
		pusherClient
			.subscribe(channel)
			.bind("new-message", (data: _Message) => {
				// setMessages((prev) => [...prev, data]);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='flex flex-col gap-4 px-8 h-full overflow-y-scroll justify-end'>
			{groupMessages(chatContext.chatHistory.find(c => c.id == chat.id)!.messages).map(
				(group, index) =>
					group.length > 0 && (
						<div
							className={`flex gap-2 w-full ${
								group[0].author.id == session?.user?.id
									? "flex-row-reverse"
									: ""
							}`}
							key={index}
						>
							<Image
								src={group[0].author.profilePicture}
								alt={`${group[0].author.name}'s avatar`}
								width={40}
								height={40}
								className='w-8 h-8 rounded-md border-black border-2'
							/>
							<div className='flex flex-col w-full gap-1'>
								{group.map((message, i) => (
									<Message
										key={message.id}
										chatType={chat.type}
										first={i == 0}
										author={
											message.author.id ==
											session?.user?.id
										}
										message={message}
									/>
								))}
							</div>
						</div>
					)
			)}
		</div>
	);
}
