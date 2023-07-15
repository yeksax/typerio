"use client";

import { useChat } from "@/hooks/ChatContext";
import { FiMail } from "react-icons/fi";
import { NavItem } from "../NavItem";
import { useAtom } from "jotai";
import { unreadMessagesAtom } from "@/atoms/notificationsAtom";

interface Props {
	forceCollapse?: boolean;
}

export default function ChatSidebarToggler({ forceCollapse }: Props) {
	const chat = useChat();
	const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);

	return (
		<button
			onClick={() => {
				chat.setSidebarVisibility(!chat.isSidebarVisible);
			}}
		>
			<NavItem
				blob={unreadMessages}
				name='Mostrar historico'
			>
				<FiMail size={16} />
			</NavItem>
		</button>
	);
}
