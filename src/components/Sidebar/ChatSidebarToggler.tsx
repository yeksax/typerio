"use client";

import { useChat } from "@/hooks/ChatContext";
import { FiMail } from "react-icons/fi";
import { NavItem } from "../NavItem";

interface Props {
	forceCollapse?: boolean;
}

export default function ChatSidebarToggler({ forceCollapse }: Props) {
	const chat = useChat();
	return (
		<button
			onClick={() => {
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
