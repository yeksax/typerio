"use client";

import { audioStart, audioState, soundWave } from "@/atoms/messagerAtom";
import { useUploadThing } from "@/services/uploadthing";
import { _Message } from "@/types/interfaces";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { FiMic, FiSend, FiStopCircle } from "react-icons/fi";
import { sendAudio } from "./actions";

interface Props {
	user?: string;
	chat?: string;
	mention: _Message | null;
}

export const waveCount = 50;
export const waveDuration = 175;

export default function AudioRecorder({ chat, user, mention }: Props) {
	const mediaRecorder = useRef<MediaRecorder>();
	const volumeCallback = useRef<any>();
	const audioChunks = useRef<Blob[]>();

	const [audioStartedAt, setAudioStart] = useAtom(audioStart);
	const [audioWave, setSoundWave] = useAtom(soundWave);
	const [currentAudioState, setAudioState] = useAtom(audioState);

	const { startUpload: startAudioUpload } = useUploadThing("audioUploader", {
		onClientUploadComplete: async (data) => {
			await sendAudio(data![0].fileUrl, user!, chat!, mention);
			setAudioState("idle");
		},
	});

	async function clientUpdatePercent(
		percent: number,
		user: string,
		channelName: string
	) {
		await fetch(process.env.PAGE_URL! + "/api/pusher/updateStatus", {
			method: "POST",
			body: JSON.stringify({
				percent: percent,
				channel: `${user}__${channelName}`,
			}),
			cache: "no-store",
		});

		return;
	}

	useEffect(() => {
		let timer = setInterval(() => {
			if (currentAudioState === "recording") {
				if (volumeCallback.current) volumeCallback.current();
			}
		}, waveDuration);

		return () => {
			clearInterval(timer);
		};
	}, [currentAudioState]);

	function recordAudio() {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
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

						averageVolume -= 20;
						if (averageVolume < 0) {
							averageVolume = 0;
						}

						setSoundWave((prev) => [
							...prev,
							{
								timestamp: new Date().getTime(),
								value: averageVolume,
							},
						]);
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

	if (!user || !chat) {
		return <></>;
	}

	return (
		<>
			<span className='h-5'>
				{currentAudioState === "recording" ? (
					<FiStopCircle
						size={20}
						className='cursor-pointer'
						onClick={() => {
							setAudioState("idle");
							if (mediaRecorder.current)
								mediaRecorder.current.stop();
						}}
					/>
				) : (
					<FiMic
						size={20}
						className='cursor-pointer'
						onClick={() => {
							setAudioState("recording");
							setAudioStart(new Date());
							recordAudio();
						}}
					/>
				)}
			</span>
			{currentAudioState === "recording" && (
				<button
					className='h-5'
					onClick={async () => {
						setAudioState("sending");

						if (mediaRecorder.current) mediaRecorder.current.stop();

						await clientUpdatePercent(10, user!, "sending-message");

						let blob = new Blob(audioChunks.current, {
							type: "audio/mp3",
						});

						startAudioUpload([new File([blob], "audio.mp3")]);
					}}
				>
					<FiSend size={20} className='cursor-pointer' />
				</button>
			)}
		</>
	);
}
