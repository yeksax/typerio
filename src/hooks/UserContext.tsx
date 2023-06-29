"use client";

import { _User } from "@/types/interfaces";
import { useSession } from "next-auth/react";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

const userContext = createContext<_User | null>(null);

export default function UserProvider({ children }: { children: ReactNode }) {
	const { data: session } = useSession();

	const [user, setUser] = useState<_User | null>(null);

	useEffect(() => {
		if (session?.user?.id) {
			fetch(`/api/user/me`).then((res) =>
				res.json().then((data: _User) => {
					setUser(data);
				})
			);
		}
	}, [session]);

	return (
		<userContext.Provider value={user}>
			{children}
		</userContext.Provider>
	);
}

export const useUser = () => useContext(userContext);
