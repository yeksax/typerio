"use client";

import { useNotifications } from "@/hooks/NotificationContext";
import Notification from "./Notification";
import { useEffect } from "react";

interface Props {}

export default function Notifications({}: Props) {
	const { setNotifications, notifications } = useNotifications();
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
