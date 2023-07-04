import { atom } from "jotai";

export const likedPostsAtom = atom<string[]>([]);
export const unlikedPostsAtom = atom<string[]>([]);
export const followedUsersAtom = atom<string[]>([]);
export const unfollowedUsersAtom = atom<string[]>([]);
export const mutedChatsAtom = atom<string[]>([]);
export const unmutedChatsAtom = atom<string[]>([]);
export const fixedChatsAtom = atom<string[]>([]);
export const unfixedChatsAtom = atom<string[]>([]);