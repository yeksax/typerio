"use client";

import { notificationsAtom } from "@/atoms/notificationsAtom";
import { pusherClient } from "@/services/pusher";
import { _Notification } from "@/types/interfaces";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface INotificationsContext {
	notifications: _Notification[];
	setNotifications: (notifications: _Notification[]) => void;
}

const notificationsContext = createContext<INotificationsContext>({
	notifications: [],
	setNotifications: (notifications) => {},
});

export default function NotificationsProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [notifications, setNotifications] = useAtom(notificationsAtom);
	const { data: session } = useSession();

	useEffect(() => {
		fetch(`/api/user/me/notifications`).then(async (r) => {
			const data: _Notification[] = await r.json();
			setNotifications(data);
		});
	}, []);

	useEffect(() => {
		if (session?.user) {
			pusherClient
				.subscribe(`user__${session?.user?.id}__notifications`)
				.bind("new-notification", (notification: _Notification) => {
					setNotifications((prev) => [notification, ...prev]);
				})
				.bind("remove-notification", (notification: string) => {
					setNotifications((prev) =>
						prev.filter((n) => n.id !== notification)
					);
				})
				.bind("update-notification", (notification: string) => {
					setNotifications((prev) =>
						prev.map((n) => (n.id === notification ? { ...n } : n))
					);
				});
		}

		return () => {
			pusherClient.unsubscribe(
				`user__${session?.user?.id}__notifications`
			);
		};
	}, [session?.user?.id]);

	return (
		<notificationsContext.Provider
			value={{ notifications, setNotifications }}
		>
			{children}
		</notificationsContext.Provider>
	);
}
