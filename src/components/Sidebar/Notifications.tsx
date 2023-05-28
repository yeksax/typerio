"use client";

import { faBell } from "@fortawesome/free-solid-svg-icons";
import { NavItem } from "../NavItem";
import { useEffect, useState } from "react";
import { pusherClient } from "@/services/pusher";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";

interface Props {}

export default function Notifications({}: Props) {
	let notifications = useNotifications();
	const { data: session } = useSession();

	return (
		<NavItem
			name='Notificações'
			url='/notifications'
			blob={notifications}
			icon={faBell}
		/>
	);
}
