"use client";

import { getmssTime } from "@/utils/client/readableTime";
import { useEffect, useRef, useState } from "react";
import { FiLoader, FiPause, FiPlay } from "react-icons/fi";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/ChatContext";

interface Props {
	src: string;
	sentAt: string;
}

async function getBlobDuration(blob: Blob | String): Promise<number> {
	const tempVideoEl = document.createElement("video");

	const durationP: Promise<number> = new Promise((resolve, reject) => {
		tempVideoEl.addEventListener("loadedmetadata", () => {
			// Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
			if (tempVideoEl.duration === Infinity) {
				tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;
				tempVideoEl.ontimeupdate = () => {
					tempVideoEl.ontimeupdate = null;
					resolve(tempVideoEl.duration);
					tempVideoEl.currentTime = 0;
				};
			}
			// Normal behavior
			else resolve(tempVideoEl.duration);
		});
		// @ts-expect-error
		tempVideoEl.onerror = (event) => reject(event.target.error);
	});

	// @ts-expect-error
	tempVideoEl.src =
		typeof blob === "string" || blob instanceof String
			? blob
			: window.URL.createObjectURL(blob);

	return durationP;
}

export default function AudioElement({ src, sentAt }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const audioSrc = useRef<string>();

	const chatCtx = useChat();

	const [elapsed, setElapsed] = useState<number>(0);

	const [duration, setDuration] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isChangingPlayback, setChangingPlayback] = useState<boolean>(false);

	useEffect(() => {
		fetch(src, {
			cache: "force-cache",
			next: {
				revalidate: false,
			},
		})
			.then((res) => res.blob())
			.then(async (blob) => {
				audioSrc.current = URL.createObjectURL(blob);
				audioRef.current = new Audio(audioSrc.current);

				let dur = await getBlobDuration(blob);
				setDuration(dur);

				audioRef.current.ontimeupdate = (ev) => {
					let el = ev.currentTarget as HTMLAudioElement;
					setElapsed(el.currentTime);

					if (el.currentTime == dur) {
						setElapsed(0);
						setIsPlaying(false);
					}
				};
			});
	}, []);

	useEffect(() => {
		if (chatCtx.currentAudio != audioRef.current) {
			audioRef.current?.pause();
			setIsPlaying(false);
			return;
		}

		if (isPlaying) {
			chatCtx.currentAudio?.play();
		} else {
			chatCtx.currentAudio?.pause();
		}
	}, [chatCtx.currentAudio, isPlaying]);

	return (
		<>
			<div className='flex flex-col gap-2 py-1 w-full'>
				<div className='flex gap-4 items-center w-full'>
					<div
						className='cursor-pointer'
						onClick={() =>
							chatCtx.setCurrentAudio(audioRef.current!)
						}
					>
						{duration > 0 ? (
							isPlaying ? (
								<FiPause onClick={(e) => setIsPlaying(false)} />
							) : (
								<FiPlay onClick={(e) => setIsPlaying(true)} />
							)
						) : (
							<FiLoader className='animate-spin' />
						)}
					</div>

					<div
						className='relative w-32 md:w-72 h-2'
						onMouseDown={(e) => {
							setChangingPlayback(true);
							let element = e.target as HTMLSpanElement;
							let x;
							let { left, width } =
								element.getBoundingClientRect();
							let clickX = e.clientX;

							x = clickX - left;
							let percentage = x / width;

							audioRef.current!.currentTime =
								percentage * duration;
						}}
						onMouseUp={(e) => {
							setChangingPlayback(false);
						}}
						onMouseMove={(e) => {
							if (isChangingPlayback) {
								let element = e.target as HTMLSpanElement;
								let x;
								let { left, width } =
									element.getBoundingClientRect();
								let clickX = e.clientX;

								x = clickX - left;
								let percentage = x / width;

								audioRef.current!.currentTime =
									percentage * duration;
							}
						}}
					>
						<span className='h-1 rounded-full bg-gray-300 top-1/2 -translate-y-1/2 w-full absolute'></span>
						<motion.span
							className='absolute h-1 rounded-full top-1/2 pointer-events-none -translate-y-1/2 bg-black w-full'
							initial={{
								width: "0%",
							}}
							animate={{
								width:
									(elapsed > 0 ? elapsed / duration : 0) *
										100 +
									"%",
							}}
							transition={{
								ease: "linear",
								duration: 0.05,
							}}
						></motion.span>
						<motion.span
							className='w-2 h-2 rounded-full bg-black absolute top-1/2 -translate-y-1/2 -translate-x-1/2'
							animate={{
								left:
									(elapsed > 0 ? elapsed / duration : 0) *
										100 +
									"%",
							}}
							transition={{
								ease: "linear",
								duration: 0.05,
							}}
						></motion.span>
					</div>
				</div>

				<div className='flex justify-between items-center text-xs'>
					<span>
						{elapsed > 0
							? getmssTime(new Date(elapsed * 1000))
							: getmssTime(new Date(duration * 1000))}
					</span>
					<span className='text-gray-500'>{sentAt}</span>
				</div>
			</div>
		</>
	);
}
