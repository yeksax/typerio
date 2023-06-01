"use client";

import { useChat } from "@/contexts/ChatContext";
import Image from "next/image";

interface Props {}

export default function ChatHeader({}: Props) {
	const { currentChat } = useChat();

	return (
		<div className='border-b-2 border-b-black px-8 py-4 flex items-center justify-between w-full'>
			<div className='flex gap-4'>
				<Image
					className='h-11 w-11 rounded-md border-2 border-black'
					src={currentChat!.thumbnail}
					width={40}
					height={40}
					alt={currentChat!.name}
				/>
				<div className='flex flex-col justify-between'>
					<h1 className='text-lg font-bold'>{currentChat!.name}</h1>
					<pre className='text-xs font-semibold'>
						{currentChat!.description}
					</pre>
				</div>
			</div>
		</div>
	);
}
