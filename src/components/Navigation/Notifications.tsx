"use client";

import { notificationsAtom } from "@/atoms/notificationsAtom";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { FiBell } from "react-icons/fi";
import { NavItem } from "../NavItem";

interface Props {}

export default function Notifications({}: Props) {
	const [notifications, setNotifications] = useAtom(notificationsAtom);
	const { data: session } = useSession();

	return (
		<NavItem
			name='Notificações'
			url='/notifications'
			blob={notifications.filter((n) => !n.isRead).length}
		>
			<FiBell size={16} />
		</NavItem>
	);
}
