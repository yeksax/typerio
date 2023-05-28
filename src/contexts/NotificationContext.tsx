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
import { _Notification } from "@/types/interfaces";
import { pusherClient } from "@/services/pusher";

const notificationsContext = createContext<number>(0);

export default function NotificationsProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { data: session } = useSession();
	const [notifications, setNotifications] = useState<number>(0);

	useEffect(() => {
		if (session?.user) {
			axios
				.get(
					`http://localhost:3000/api/user/${session?.user?.id}/notifications`
				)
				.then((res) => {
					setNotifications(
						res.data.filter(
							(n: _Notification) => n.isRead === false
						).length
					);
				});

			pusherClient.unsubscribe(
				`user__${session?.user?.id}__notifications`
			);
			const channel = pusherClient.subscribe(
				`user__${session?.user?.id}__notifications`
			);

			channel.bind("set-notifications", (notifications: number) => {
				setNotifications(notifications);
			});

			channel.bind("clear-notifications", () => {
				setNotifications(0);
			});
		}
	}, [session?.user]);

	return (
		<notificationsContext.Provider value={notifications}>
			{children}
		</notificationsContext.Provider>
	);
}

export const useNotifications = () => useContext(notificationsContext);
