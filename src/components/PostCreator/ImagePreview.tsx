"use client";

import { creatorFiles } from "@/atoms/creatorState";
import { useAtom } from "jotai";
import Image from "next/image";
import { SetStateAction } from "react";
import { FiX } from "react-icons/fi";

interface Props {
	src: string;
	id: string;
	colspan?: boolean;
}

export default function ImagePreview({ id, src, colspan }: Props) {
	const [files, setFiles] = useAtom(creatorFiles);

	return (
		<div
			className='relative h-full w-full'
			style={
				colspan
					? {
							gridRow: "1 / span 2",
					  }
					: {}
			}
		>
			<Image
				src={src}
				alt='image preview'
				width={400}
				height={400}
				className='w-full h-full aspect-square object-cover border-black border-2 rounded-md'
			/>
			<FiX
				onClick={() => {
					setFiles((prev) => prev.filter((f) => f.id != id));
				}}
				className='absolute right-2 border-2 border-black cursor-pointer top-2 bg-white rounded-md p-0.5 box-content w-3 h-3 text-black grid place-items center'
			/>
		</div>
	);
}
