"use client";

import { unreadMessagesAtom } from "@/atoms/notificationsState";
import { useAtom } from "jotai";
import { FiMail } from "react-icons/fi";
import { NavItem } from "../NavItem";

interface Props {
	forceCollapse: boolean;
}

export default function Messages({ forceCollapse }: Props) {
	const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);

	return (
		<NavItem
			forceCollapse={forceCollapse}
			name='Mensagens'
			url='/typos'
			blob={unreadMessages > 9 ? "9+" : unreadMessages}
		>
			<FiMail size={16} />
		</NavItem>
	);
}
