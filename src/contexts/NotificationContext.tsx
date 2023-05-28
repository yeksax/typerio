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
			fetch(
				`/api/user/${session?.user?.id}/notifications`,
				{
					cache: "no-store",
				}
			).then((r) => {
				r.json().then((data) => {
					setNotifications(
						data.filter((n: _Notification) => n.isRead === false)
							.length
					);
				});
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
		}
	}, [session?.user]);

	return (
		<notificationsContext.Provider value={notifications}>
			{children}
		</notificationsContext.Provider>
	);
}

export const useNotifications = () => useContext(notificationsContext);
