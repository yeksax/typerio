"use client";

import { useChat } from "@/hooks/ChatContext";
import { useUser } from "@/hooks/UserContext";
import { useUploadThing } from "@/services/uploadthing";
import { getmssTime } from "@/utils/client/readableTime";
import { motion } from "framer-motion";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { FiLoader, FiMic, FiSend, FiStopCircle, FiX } from "react-icons/fi";
import { sendAudio, updatePercent } from "./actions";
import { useAtom } from "jotai";
import {
	audioStart as audioStartedAt,
	isRecordingAudio,
	soundWave as audioWave,
	audioStart,
	soundWave,
	audioState,
} from "@/atoms/messagerAtom";
import AudioRecorder from "./AudioRecorder";

const waveCount = 100;
const waveDuration = 250;

interface Props {
	sending: boolean;
}

export default function MessageInput({ sending }: Props) {
	const submitButton = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const user = useUser();
	const chat = useChat();
	const { currentMention: mention } = chat;

	const [currentAudioState, setAudioState] = useAtom(audioState);
	const [audioStartedAt, setAudioStart] = useAtom(audioStart);
	const [audioWave, setSoundWave] = useAtom(soundWave);

	function resize(e: HTMLElement) {
		e.style.height = "1lh";
		e.style.height = e.scrollHeight + "px";
	}

	function shortcutHandler(e: KeyboardEvent<HTMLTextAreaElement>) {
		if (!e.shiftKey && e.key === "Enter") {
			e.preventDefault();
			submitButton.current!.click();
			e.currentTarget.focus();
		}

		if (e.key === "Escape") {
			chat.setCurrentMention(null);
		}
	}

	useEffect(() => {
		if (mention) inputRef.current!.focus();
	}, [mention]);

	useEffect(() => resize(inputRef.current!), [mention, sending]);

	return (
		<div className='flex flex-col gap-2 w-full'>
			{mention && (
				<div className='border-l-2 border-gray-600 pl-2 text-gray-700 text-xs w-full'>
					<span className='font-semibold flex justify-between'>
						{mention.author.name}
						<FiX
							size={16}
							className='cursor-pointer'
							onClick={() => {
								chat.setCurrentMention(null);
							}}
						/>
					</span>
					<pre className='truncate break-all'>
						{mention.audio ? (
							<span className='flex gap-1 items-center'>
								<FiMic /> Audio
							</span>
						) : (
							mention.content
						)}
					</pre>
				</div>
			)}
			<div className='flex gap-2 items-center relative'>
				{(sending || currentAudioState === "sending") && (
					<div
						className='absolute left-0'
						style={{
							top: "0.175rem",
						}}
					>
						<FiLoader className='animate-spin' />
					</div>
				)}
				<textarea
					onChange={(e) => resize(e.target)}
					onKeyDown={shortcutHandler}
					disabled={
						sending ||
						currentAudioState === "sending" ||
						currentAudioState === "recording"
					}
					ref={inputRef}
					autoFocus
					name='content'
					className={`${
						sending || currentAudioState === "sending"
							? "indent-6 text-gray-600"
							: ""
					} ${
						currentAudioState === "recording" ? "hidden" : ""
					} resize-none box-border disabled:bg-white overflow-y-auto w-full outline-none text-sm`}
					style={{
						height: "1lh",
						maxHeight: "4lh",
					}}
					placeholder={
						currentAudioState === "recording"
							? "Gravando..."
							: currentAudioState === "sending"
							? "Enviando Audio..."
							: `O que ${
									user ? user.name : "você"
							  } anda pensando?`
					}
				></textarea>
				{currentAudioState === "recording" && (
					<div className='flex gap-2 w-full items-center text-sm'>
						<span>
							{audioStartedAt
								? getmssTime(
										new Date(
											new Date().getTime() -
												audioStartedAt.getTime()
										)
								  )
								: 0}
						</span>
						<div className='w-full h-4 relative overflow-hidden'>
							<motion.div
								className='flex absolute h-8 top-1/2 -translate-y-1/2 items-center justify-end gap-0.5'
								initial={{
									left: "100%",
									transform: "translateX(0) translateY(-50%)",
								}}
							>
								{audioWave
									.slice(-waveCount)
									.map((averageVolume, i) => (
										<motion.span
											key={i}
											className='w-0.5 absolute rounded-full bg-black'
											initial={{
												height: 0,
												minHeight: 2,
												right: 0,
											}}
											animate={{
												height: `${averageVolume}%`,
												right: `${
													(audioWave.slice(-waveCount)
														.length -
														i) *
													4
												}px`,
											}}
											transition={{
												duration: waveDuration * 0.001,
												ease: "linear",
											}}
										></motion.span>
									))}
							</motion.div>
						</div>
					</div>
				)}
				<AudioRecorder
					chat={chat.currentChat?.id}
					mention={mention}
					user={user?.id}
				/>
				{currentAudioState === "idle" && (
					<button className='h-5' type='submit' ref={submitButton}>
						<FiSend size={20} className='cursor-pointer' />
					</button>
				)}
			</div>
		</div>
	);
}
