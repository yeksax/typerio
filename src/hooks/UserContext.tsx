"use client";

import { _User } from "@/types/interfaces";
import { Preferences } from "@prisma/client";
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

	const [user, setUser] = useState<_User | null>(null);
	const [preferences, setPreferences] = useState<Preferences | null>(null);

	useEffect(() => {
		if (session?.user?.id) {
			fetch(`/api/user/me`).then((res) =>
				res.json().then((data: _User) => {
					setUser(data);
					setPreferences(data.preferences!);
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

export const useUser = () => useContext(userContext);
export const usePreferences = () => useContext(settingsContext);
