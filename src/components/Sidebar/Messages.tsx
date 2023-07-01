"use client";

import { useChat } from "@/hooks/ChatContext";
import { Session } from "next-auth";
import { FiMail } from "react-icons/fi";
import { NavItem } from "../NavItem";
import { unreadMessagesAtom } from "@/atoms/notificationsAtom";
import { useAtom } from "jotai";

interface Props {
	forceCollapse?: boolean | undefined;
	session: Session | null;
}

export default function Messages({ forceCollapse, session }: Props) {
	const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);

	return (
		<NavItem
			name='Mensagens'
			url='/typos'
			blob={unreadMessages > 9 ? "9+" : unreadMessages}
			forceCollapse={forceCollapse}
		>
			<FiMail size={16} />
		</NavItem>
	);
}
