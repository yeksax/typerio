"use client";

import { useChat } from "@/contexts/ChatContext";
import { useUser } from "@/contexts/UserContext";
import { useUploadThing } from "@/services/uploadthing";
import { getmssTime } from "@/utils/client/readableTime";
import { motion } from "framer-motion";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { FiLoader, FiMic, FiSend, FiStopCircle, FiX } from "react-icons/fi";
import { sendAudio, updatePercent } from "./actions";

interface Props {
	sending: boolean;
}

const waveCount = 100;
const waveDuration = 250;

export default function MessageInput({ sending }: Props) {
	const submitButton = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const user = useUser();
	const chat = useChat();
	const { currentMention: mention } = chat;

	const mediaRecorder = useRef<MediaRecorder>();
	const volumeCallback = useRef<any>();
	const audioChunks = useRef<Blob[]>();

	const [audioStart, setAudioStart] = useState<null | Date>(null);
	const [recordingAudio, setRecordingAudio] = useState(false);
	const [soundWave, setSoundWave] = useState<number[]>([]);

	const [sendingAudio, setSendingAudio] = useState(false);

	const { startUpload: startAudioUpload } = useUploadThing({
		endpoint: "audioUploader",
		onClientUploadComplete: async (data) => {
			await sendAudio(
				data![0].fileUrl,
				user!.id,
				chat.currentChat!.id,
				mention
			);
			setSendingAudio(false);
		},
		onUploadError: () => {
			alert("error occurred while uploading");
		},
	});

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
		let timer = setInterval(() => {
			if (recordingAudio) {
				if (volumeCallback.current) volumeCallback.current();
			}
		}, waveDuration);

		return () => {
			clearInterval(timer);
		};
	}, [recordingAudio]);

	function recordAudio() {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			let test: any = navigator.mediaDevices
				.getUserMedia(
					// constraints - only audio needed for this app
					{
						audio: {},
					}
				)

				// Success callback
				.then((stream) => {
					mediaRecorder.current = new MediaRecorder(stream);
					setSoundWave([]);
					mediaRecorder.current.start();

					audioChunks.current = [];

					const audioContext = new AudioContext();
					const audioSource =
						audioContext.createMediaStreamSource(stream);
					const analyser = audioContext.createAnalyser();
					analyser.fftSize = 512;
					analyser.minDecibels = -127;
					analyser.maxDecibels = 0;
					analyser.smoothingTimeConstant = 0.4;
					audioSource.connect(analyser);

					const volumes = new Uint8Array(analyser.frequencyBinCount);

					volumeCallback.current = () => {
						analyser.getByteFrequencyData(volumes);
						let volumeSum = 0;
						for (const volume of volumes) volumeSum += volume;
						let averageVolume =
							(volumeSum / volumes.length / 127) * 100;
						// Value range: 127 = analyser.maxDecibels - analyser.minDecibels;

						averageVolume -= 10;
						if (averageVolume < 0) {
							averageVolume = 0;
						}

						setSoundWave((prev) => [...prev, averageVolume]);
					};

					mediaRecorder.current!.ondataavailable = (e) => {
						audioChunks.current!.push(e.data);
						setSoundWave([]);

						stream.getAudioTracks().forEach(function (track) {
							track.stop();
						});
					};
				})

				// Error callback
				.catch((err) => {
					console.error(
						`The following getUserMedia error occurred: ${err}`
					);
				});
		} else {
			console.log("getUserMedia not supported on your browser!");
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
				{(sending || sendingAudio) && !recordingAudio && (
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
					disabled={sending || recordingAudio || sendingAudio}
					ref={inputRef}
					autoFocus
					name='content'
					className={`${
						sending || sendingAudio ? "indent-6 text-gray-600" : ""
					} ${
						recordingAudio ? "hidden" : ""
					} resize-none box-border disabled:bg-white overflow-y-auto w-full outline-none text-sm`}
					style={{
						height: "1lh",
						maxHeight: "4lh",
					}}
					placeholder={
						recordingAudio
							? "Gravando..."
							: sendingAudio
							? "Enviando Audio..."
							: `O que ${
									user ? user.name : "você"
							  } anda pensando?`
					}
				></textarea>
				{recordingAudio && (
					<div className='flex gap-2 w-full items-center text-sm'>
						<span>
							{audioStart
								? getmssTime(
										new Date(
											new Date().getTime() -
												audioStart?.getTime()
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
								{soundWave
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
													(soundWave.slice(-waveCount)
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
				<span
					className='h-5'
					onClick={() => setRecordingAudio(!recordingAudio)}
				>
					{recordingAudio ? (
						<FiStopCircle
							size={20}
							className='cursor-pointer'
							onClick={() => {
								if (mediaRecorder.current)
									mediaRecorder.current.stop();
							}}
						/>
					) : (
						<FiMic
							size={20}
							className='cursor-pointer'
							onClick={() => {
								setAudioStart(new Date());
								recordAudio();
							}}
						/>
					)}
				</span>
				{recordingAudio ? (
					<button
						className='h-5'
						onClick={async () => {
							setRecordingAudio(false);
							setSendingAudio(true);

							if (mediaRecorder.current)
								mediaRecorder.current.stop();

							await updatePercent(
								10,
								user!.id,
								"sending-message"
							);

							let blob = new Blob(audioChunks.current, {
								type: "audio/mp3",
							});

							startAudioUpload([new File([blob], "audio.mp3")]);
						}}
					>
						<FiSend size={20} className='cursor-pointer' />
					</button>
				) : (
					<button className='h-5' type='submit' ref={submitButton}>
						<FiSend size={20} className='cursor-pointer' />
					</button>
				)}
			</div>
		</div>
	);
}
