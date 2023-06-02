"use client";

import { useChat } from "@/contexts/ChatContext";
import { NavItem } from "../NavItem";
import { FiClock } from "react-icons/fi";
import { faClock, faHistory } from "@fortawesome/free-solid-svg-icons";

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
				icon={faHistory}
				name='Mostrar historico'
			/>
		</button>
	);
}
