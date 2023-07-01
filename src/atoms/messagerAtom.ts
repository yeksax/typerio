import { atom } from "jotai";

export const isRecordingAudio = atom(false);
export const audioStart = atom<null | Date>(null);
export const soundWave = atom<number[]>([]);
export const audioState = atom<"sending" | "idle" | "recording">("idle");
