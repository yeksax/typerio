import { atom } from "jotai";

export const likedPostsAtom = atom<string[]>([]);
export const followedUsersAtom = atom<string[]>([]);
export const unfollowedUsersAtom = atom<string[]>([]);
