import { atom } from "jotai";

export const creatorFloat = atom(false);
export const creatorIntersection = atom(true);
export const creatorText = atom("");
export const creatorFiles = atom<{ id: string; file: File, dataUrl: string, name: string, size: number }[]>([]);
