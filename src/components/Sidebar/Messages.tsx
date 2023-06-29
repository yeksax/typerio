"use client";

import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { NavItem } from "../NavItem";
import { useChat } from "@/hooks/ChatContext";
import { Session } from "next-auth";
import { FiMail } from "react-icons/fi";

interface Props {
	forceCollapse?: boolean | undefined;
	session: Session | null;
}

export default function Messages({ forceCollapse, session }: Props) {
	const chatCtx = useChat();

	return (
		<NavItem
			name='Mensagens'
			url='/typos'
			blob={chatCtx.unreadMessages > 9 ? "9+" : chatCtx.unreadMessages}
			forceCollapse={forceCollapse}
		>
			<FiMail size={16}/>
		</NavItem>
	);
}
