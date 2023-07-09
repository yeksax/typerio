"use client";

import { pinnedPostAtom, preferencesAtom, userAtom } from "@/atoms/appState";
import { _User } from "@/types/interfaces";
import { Preferences } from "@prisma/client";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import {
	Dispatch,
	ReactNode,
	SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

const userContext = createContext<_User | null>(null);
const settingsContext = createContext<{
	preferences: Preferences | null;
	setPreferences: Dispatch<SetStateAction<Preferences | null>>;
}>({
	preferences: null,
	setPreferences: () => {},
});

export default function UserProvider({ children }: { children: ReactNode }) {
	const { data: session } = useSession();

	const [preferences, setPreferences] = useAtom(preferencesAtom);
	const [isPinned, setPinned] = useAtom(pinnedPostAtom);
	const [user, setUser] = useAtom(userAtom);

	useEffect(() => {
		if (session?.user?.id) {
			fetch(`/api/user/me`).then((res) =>
				res.json().then((data: _User) => {
					setUser(data);
					setPreferences(data.preferences!);
					setPinned(data.pinnedPostId);
				})
			);
		}
	}, [session]);

	return (
		<userContext.Provider value={user}>
			<settingsContext.Provider value={{ preferences, setPreferences }}>
				{children}
			</settingsContext.Provider>
		</userContext.Provider>
	);
}