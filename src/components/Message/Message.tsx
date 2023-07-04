"use client";

import { useChat } from "@/hooks/ChatContext";
import { _Chat, _Message } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/client/readableTime";
import { motion, useDragControls } from "framer-motion";
import { useEffect } from "react";
import { FiMic } from "react-icons/fi";
import AudioElement from "./Audio";

interface Props {
	message: _Message;
	first: boolean;
	author: boolean;
	chatType: _Chat["type"];
}

export default function Message({
	message,
	chatType,
	first,
	author: isAuthor,
}: Props) {
	const chat = useChat();
	const controls = useDragControls();

	useEffect(() => {
		document.addEventListener("mouseup", () => {
			let draggables = document.getElementsByClassName("react-draggable");
			for (let i = 0; i < draggables.length; i++) {
				(draggables[i] as HTMLElement).style.transform =
					"translate(0px, 0px)";
			}
		});
	}, []);

	return (
		// @ts-ignore

		<div
			onDoubleClick={() => {
				chat.setCurrentMention(message);
			}}
			id={`message_${message.id}`}
			className={`flex ${isAuthor ? "justify-end" : ""}`}
		>
			<motion.div
				className={`max-w-9/10 md:max-w-7/10 flex gap-2 items-start ${
					isAuthor ? "flex-row-reverse" : ""
				}`}
			>
				<motion.div
					drag='x'
					dragControls={controls}
					dragConstraints={{ left: 0, right: 0 }}
					dragSnapToOrigin
					dragTransition={{
						bounceStiffness: 1000,
					}}
					onDragEnd={(e) => {
						chat.setCurrentMention(message);
					}}
					className={`${
						first &&
						(isAuthor
							? "first-of-type:rounded-tr-sm"
							: "first-of-type:rounded-tl-sm")
					} text-black border-2 border-black px-2 md:px-3 py-0.5 text-sm rounded-lg flex flex-col`}
				>
					{first && !isAuthor && (
						<pre
							className={`flex flex-col gap-0.5 break-words text-xs whitespace-pre-wrap`}
						>
							<span className='font-bold'>
								{message.author.name}
							</span>
						</pre>
					)}
					{message.mention && (
						<a href={`#message_${message.mention.id}`}>
							<pre
								className={`flex flex-col gap-0.5 pl-2 mb-1.5 border-l-2 border-gray-600 text-gray-600 break-words text-xs whitespace-pre-wrap`}
							>
								<span className='font-bold'>
									{isAuthor
										? "eu"
										: message.mention.author!.name}
								</span>
								<span>
									{message.mention.audio ? (
										<span className='flex items-center'>
											<FiMic /> Audio
										</span>
									) : (
										message.mention.content
									)}
								</span>
							</pre>
						</a>
					)}
					<pre
						className={`break-words text-xs md:text-sm whitespace-pre-wrap relative`}
					>
						{message.audio ? (
							<AudioElement
								src={message.audio}
								sentAt={getHHmmTime(message.createdAt)}
							/>
						) : (
							<>
								<span>{message.content}</span>
								<span className='text-xs md:mt-1 ml-2 text-gray-500 float-right'>
									{getHHmmTime(message.updatedAt)}
								</span>
							</>
						)}
					</pre>
				</motion.div>
			</motion.div>
		</div>
	);
}
