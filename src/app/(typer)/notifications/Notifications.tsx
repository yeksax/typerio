"use client";

import { unreadNotificationsAtom } from "@/atoms/notificationsAtom";
import { useAtom } from "jotai";
import { useEffect } from "react";
import Notification from "./Notification";

interface Props {}

export default function Notifications({}: Props) {
	const [notifications, setNotifications] = useAtom(unreadNotificationsAtom);
	useEffect(() => {
		setNotifications([
			...notifications.map((n) => ({ ...n, isRead: true })),
		]);
	}, []);

	return (
		<div className='flex flex-col h-full overflow-y-auto border-scroll'>
			{notifications.map((notification) => (
				<Notification
					key={notification.id}
					notification={notification}
				/>
			))}
		</div>
	);
}
