"use client";

import { File } from "@prisma/client";
import Image from "next/image";

interface Props {
	file: File;
	index: number;
}

export default function PostImage({ file }: Props) {
	return (
		<div className='w-full h-full'>
			<Image
				src={file.url}
				width={400}
				height={400}
				alt='image'
				loading='lazy'
				className='object-cover h-full w-full rounded-md border-2 dark:border-zinc-950 border-black'
			/>
		</div>
	);
}
