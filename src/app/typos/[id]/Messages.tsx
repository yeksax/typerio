"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import Message from "@/components/Message/Message";
import { pusherClient } from "@/services/pusher";
import { _Chat, _Message } from "@/types/interfaces";
import { useChat } from "@/hooks/ChatContext";
import { Session } from "next-auth";

interface Props {
	session: Session;
	chat: _Chat;
}

export default function ChatContainer({ session, chat }: Props) {
	const chatContext = useChat();

	const [scroll, setScroll] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

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
		containerRef.current?.scrollTo({
			top: containerRef.current!.scrollHeight,
			behavior: "auto",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		containerRef.current?.scrollTo({
			top: containerRef.current!.scrollHeight,
			behavior: "auto",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatContext.chatHistory]);

	return (
		<div
			ref={containerRef}
			id='messages-container'
			onScroll={(e) => {
				let target: HTMLDivElement = e.target as HTMLDivElement;
				setScroll(target.scrollTop);
			}}
			className='flex flex-col gap-4 px-4 md:px-8 h-full overflow-y-auto pt-20 pb-16 bg-white'
		>
			<div
				onClick={(e) => {
					containerRef.current!.scrollTo({
						top: containerRef.current!.scrollHeight,
						behavior: "smooth",
					});
				}}
				className={`bg-black text-white p-1.5 z-10 absolute cursor-pointer ${
					chatContext.currentMention ? "hidden" : "bottom-16"
				} right-7`}
			>
				<FiChevronDown size={12} />
			</div>
			{groupMessages(
				chatContext.chatHistory.find((c) => c.id == chat.id)!.messages
			).map(
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
