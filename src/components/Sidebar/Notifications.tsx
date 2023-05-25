"use client";

import { faBell } from "@fortawesome/free-solid-svg-icons";
import { NavItem } from "../NavItem";
import { useEffect, useState } from "react";
import { pusherClient } from "@/services/pusher";
import { useSession } from "next-auth/react";

interface Props {
	notificationCount: number;
}

export default function Notifications({ notificationCount }: Props) {
	const [notifications, setNotifications] = useState(notificationCount);
	const { data: session } = useSession();

	useEffect(() => {
		if (session?.user) {
			pusherClient.unsubscribe(
				`user__${session?.user?.id}__notifications`
			);
			pusherClient
				.subscribe(`user__${session?.user?.id}__notifications`)
				.bind("new-notification", () => {
					setNotifications((prev) => prev + 1);
				});
		}
	}, [session?.user]);

	return (
		<NavItem
			name='Notificações'
			url='/notifications'
			blob={notifications}
			icon={faBell}
		/>
	);
}
