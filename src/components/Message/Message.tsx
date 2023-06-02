"use client";

import { useChat } from "@/contexts/ChatContext";
import { _Chat, _Message } from "@/types/interfaces";
import { getHHmmTime } from "@/utils/readableTime";
import { motion } from "framer-motion";
import { Source_Code_Pro } from "next/font/google";

interface Props {
	message: _Message;
	first: boolean;
	author: boolean;
	chatType: _Chat["type"];
}

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export default function Message({ message, chatType, first, author }: Props) {
	const chat = useChat();

	return (
		<div
			onDoubleClick={() => {
				chat.setCurrentMention(message);
			}}
			className={`flex ${author ? "justify-end" : ""}`}
		>
			<motion.div
				style={{
					maxWidth: "70%",
				}}
				className={`flex gap-2 items-start ${
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
							className={`flex flex-col gap-0.5 text-gray-600 break-words text-xs whitespace-pre-wrap`}
						>
							<span className='font-bold'>
								{message.author.name}
							</span>
						</pre>
					)}
					{message.mention && (
						<pre
							className={`flex flex-col gap-0.5 pl-2 border-l-2 border-gray-600 text-gray-600 break-words text-xs whitespace-pre-wrap`}
						>
							<span className='font-bold'>
								{message.author.name}
							</span>
							<span>{message.mention.content}</span>
						</pre>
					)}
					<pre className={`break-words whitespace-pre-wrap`}>
						{message.content}{" "}
						<span className='text-xs text-gray-500 float-right mt-1'>
							{getHHmmTime(message.updatedAt)}
						</span>
					</pre>{" "}
				</div>
			</motion.div>
		</div>
	);
}
