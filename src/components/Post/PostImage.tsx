"use client";

import { File } from "@prisma/client";
import Image from "next/image";

interface Props {
	file: File;
	colspan?: boolean;
}

export default function PostImage({ file, colspan }: Props) {
	return (
		<div
			className='w-full h-full'
			style={
				colspan
					? {
							gridRow: "1 / span 2",
					  }
					: {}
			}
		>
			<Image
				src={file.url}
				width={1080}
				height={1080}
				alt='image'
				loading='lazy'
				className={`object-cover h-full w-full rounded-md border-2 dark:border-zinc-950 border-black`}
			/>
		</div>
	);
}
