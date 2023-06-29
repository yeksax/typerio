"use client";

import { useChat } from "@/hooks/ChatContext";
import { NavItem } from "../NavItem";
import { FiClock, FiMail } from "react-icons/fi";
import { faClock, faEnvelope, faHistory } from "@fortawesome/free-solid-svg-icons";

interface Props {
	forceCollapse?: boolean;
}

export default function ChatSidebarToggler({ forceCollapse }: Props) {
	const chat = useChat();
	return (
		<button
			onClick={(e) => {
        chat.setSidebarVisibility(!chat.isSidebarVisible);
			}}
		>
			<NavItem
				forceCollapse={forceCollapse}
				name='Mostrar historico'
			>
				<FiMail size={16}/>
			</NavItem>
		</button>
	);
}
