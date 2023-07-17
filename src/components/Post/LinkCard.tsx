"use client";

import { URLMetadata } from "@/types/interfaces";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiLoader } from "react-icons/fi";

interface Props {
	url: string;
}

export default function LinkAttachment({ url }: Props) {
	const [metadata, setMetadata] = useState<URLMetadata>({});

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetch("/api/scrape", {
			method: "POST",
			cache: "force-cache",
			body: JSON.stringify({
				url,
			}),
		}).then(async (r) => {
			if (r.status === 200) {
				setMetadata(await r.json());
			}

			setIsLoading(false);
		});
	}, []);

	let readableURL = "";
	let _url = new URL(url);
	readableURL = `${_url.hostname}${_url.pathname}`;

	if (isLoading)
		return (
			<div className='flex border-black dark:border-zinc-950 border-2 rounded-md overflow-hidden'>
				<div className='w-[4.25rem] h-[4.25rem] aspect-square md:w-20 md:h-20 border-r-2 border-black dark:border-zinc-950 grid place-items-center'>
					<FiLoader size={20} className='animate-spin' />
				</div>

				<div className='flex flex-col flex-1 dark:bg-zinc-800 bg-zinc-100 gap-0.5 font-normal text-xs px-2 justify-center md:px-4 py-1.5 md:py-2'>
					<h4 className='line-clamp-1 break-all text-xxs opacity-70'>
						{readableURL}
					</h4>
					<h1 className='line-clamp-1 break-all font-semibold'>
						Carregando...
					</h1>
					<h1 className='line-clamp-1 break-all opacity-80'></h1>
				</div>
			</div>
		);

	return (
		<Link
			target='_blank'
			rel='noreferrer'
			className='flex border-black dark:border-zinc-950 border-2 rounded-md overflow-hidden'
			href={url}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				width={256}
				height={256}
				loading='lazy'
				src={metadata.image!}
				alt={`${metadata.title}`}
				className='w-[4.25rem] h-[4.25rem] object-left aspect-square md:w-20 md:h-20 border-r-2 border-black dark:border-zinc-950'
			/>
			<div className='flex flex-col flex-1 dark:bg-zinc-800 bg-zinc-50 gap-0.5 font-normal text-xs px-3 justify-center md:px-4 py-1 md:py-2'>
				<h4 className='line-clamp-1 break-all text-xxs opacity-80 dark:opacity-60'>
					{readableURL}
				</h4>
				<h1 className='line-clamp-1 break-all font-semibold'>
					{metadata.title}
				</h1>
				<h1 className='line-clamp-1 break-all opacity-75'>
					{metadata.description}
				</h1>
			</div>
		</Link>
	);
}
