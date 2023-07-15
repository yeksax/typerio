import { _Notification } from "@/types/interfaces";
import { atom } from "jotai";

export const notificationsAtom = atom<_Notification[]>([])
export const unreadMessagesAtom = atom(0)