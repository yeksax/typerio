"use client";

import { creatorFiles } from "@/atoms/creatorAtom";
import { useAtom } from "jotai";
import Image from "next/image";
import { SetStateAction } from "react";
import { FiX } from "react-icons/fi";

interface Props {
	src: string;
	id: string;
}

export default function ImagePreview({ id, src }: Props) {
	const [files, setFiles] = useAtom(creatorFiles);

	return (
		<div className='relative'>
			<Image
				src={src}
				alt='image preview'
				width={48}
				height={48}
				className='h-16 w-16 aspect-square object-cover border-black border-2 rounded-md'
			/>
			<FiX
				onClick={() => {
					setFiles((prev) => prev.filter((f) => f.id != id));
				}}
				size={14}
				className='absolute right-1 cursor-pointer top-1 w-4 h-4 text-black grid place-items center'
			/>
		</div>
	);
}
