"use client";

import Message from "@/components/Message/Message";
import { useChat } from "@/hooks/ChatContext";
import { _Chat, _Message } from "@/types/interfaces";
import { Session } from "next-auth";
import Image from "next/image";
import { RefObject, useEffect, useState } from "react";

interface Props {
	session: Session;
	chat: string;
	containerRef: RefObject<HTMLDivElement>;
}

export default function MessagesContainer({
	session,
	chat: _chat,
	containerRef,
}: Props) {
	const chatContext = useChat();

	const [chat, setChat] = useState<_Chat | null>(null);

	useEffect(() => {
		let newChat = chatContext.chatHistory.find((c) => c.id === _chat);
		if (newChat) setChat(newChat);
	}, [chatContext.chatHistory]);

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
		containerRef.current!.scrollTo({
			top: containerRef.current!.scrollHeight,
			behavior: "auto",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		containerRef.current!.scrollTo({
			top: containerRef.current!.scrollHeight,
			behavior: "auto",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatContext.chatHistory]);

	return (
		<div
			ref={containerRef}
			id='messages-container'
			className='flex flex-col gap-4 px-4 md:px-8 h-full overflow-x-hidden overflow-y-visible w-full pb-16'
			style={{
				scrollbarGutter: "stable"
			}}
		>
			{chat &&
				groupMessages(chat.messages).map(
					(group, index) =>
						group.length > 0 && (
							<div
								className={`flex gap-2 w-full first-of-type:pt-20 ${
									group[0].author.id == session?.user?.id
										? "flex-row-reverse"
										: ""
								}`}
								key={index}
							>
								{chat.type == "GROUP_CHAT" && (
									<Image
										src={group[0].author.avatar}
										alt={`${group[0].author.name}'s avatar`}
										width={40}
										height={40}
										className='w-8 h-8 rounded-md border-black border-2 hidden md:block'
									/>
								)}
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
