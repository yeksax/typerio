"use client";

import { useChat } from "@/contexts/ChatContext";
import { _Chat, _Message } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/client/readableTime";
import { motion } from "framer-motion";
import { Source_Code_Pro } from "next/font/google";
import { MouseEvent, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import AudioElement from "./Audio";
import { FiMic } from "react-icons/fi";

interface Props {
	message: _Message;
	first: boolean;
	author: boolean;
	chatType: _Chat["type"];
}

export default function Message({ message, chatType, first, author }: Props) {
	const chat = useChat();
	const draggableRef = useRef<any>(null);

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
			className={`flex ${author ? "justify-end" : ""}`}
		>
			<motion.div
				className={`max-w-9/10 md:max-w-7/10 flex gap-2 items-start ${
					author ? "flex-row-reverse" : ""
				}`}
			>
				<div
					className={`${
						first &&
						(author
							? "first-of-type:rounded-tr-sm"
							: "first-of-type:rounded-tl-sm")
					} flex flex-col border-2 border-black rounded-lg px-3 p-1 text-sm font-medium`}
				>
					{first && (
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
									{message.mention.author!.name}
								</span>
								<span>{message.mention.audio? <span className="flex items-center"><FiMic/> Audio</span> : message.mention.content}</span>
							</pre>
						</a>
					)}
					<pre
						className={`break-words text-xs md:text-sm whitespace-pre-wrap relative`}
					>
						{message.audio ? (
							<AudioElement src={message.audio} sentAt={getHHmmTime(message.createdAt)}/>
						) : (
							<>
								<span>{message.content}</span>
								<span className='text-xs md:mt-1 ml-2 text-gray-500 float-right'>
									{getHHmmTime(message.updatedAt)}
								</span>
							</>
						)}
					</pre>
				</div>
			</motion.div>
		</div>
	);
}
