"use client";

import { notificationsAtom } from "@/atoms/notificationsState";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { FiBell } from "react-icons/fi";
import { NavItem } from "../NavItem";

interface Props {
	forceCollapse: boolean;
}

export default function Notifications({ forceCollapse }: Props) {
	const [notifications, setNotifications] = useAtom(notificationsAtom);
	const { data: session } = useSession();

	return (
		<NavItem
			forceCollapse={forceCollapse}
			name='Notificações'
			url='/notifications'
			blob={notifications.filter((n) => !n.isRead).length}
		>
			<FiBell size={16} />
		</NavItem>
	);
}
