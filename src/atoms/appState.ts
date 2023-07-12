import { _User } from "@/types/interfaces";
import { Preferences } from "@prisma/client";
import { atom } from "jotai";

export const draggedFile = atom(null);

export const userAtom = atom<_User | null>(null);
export const preferencesAtom = atom<Preferences | null>(null);

export const themeAtom = atom("");
export const pinnedPostAtom = atom<string | null>(null);

export const likedPostsAtom = atom<string[]>([]);
export const unlikedPostsAtom = atom<string[]>([]);

export const followedUsersAtom = atom<string[]>([]);
export const unfollowedUsersAtom = atom<string[]>([]);

export const mutedChatsAtom = atom<string[]>([]);
export const unmutedChatsAtom = atom<string[]>([]);

export const fixedChatsAtom = atom<string[]>([]);
export const unfixedChatsAtom = atom<string[]>([]);
