"use client";

import { faBell } from "@fortawesome/free-solid-svg-icons";
import { NavItem } from "../NavItem";
import { useEffect, useState } from "react";
import { pusherClient } from "@/services/pusher";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/NotificationContext";
import { FiBell } from "react-icons/fi";

interface Props {
	forceCollapse?: boolean | undefined;
}

export default function Notifications({ forceCollapse }: Props) {
	const { setNotifications, notifications } = useNotifications();
	const { data: session } = useSession();

	return (
		<NavItem
			name='Notificações'
			url='/notifications'
			blob={notifications.filter((n) => !n.isRead).length}
			forceCollapse={forceCollapse}
		>
			<FiBell size={16}/>
		</NavItem>
	);
}
