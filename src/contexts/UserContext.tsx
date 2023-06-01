"use client";

import { useSession } from "next-auth/react";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import axios from "axios";
import { _Notification, _User } from "@/types/interfaces";
import { pusherClient } from "@/services/pusher";
import { Session } from "next-auth";

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
