"use client";

import { creatorFloat, creatorIntersection } from "@/atoms/creatorAtom";
import { forceSidebarCollapse } from "@/atoms/uiState";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { isMobile } from "react-device-detect";
import {
	FiCompass,
	FiEdit,
	FiHome,
	FiLogIn,
	FiMinimize2,
	FiSettings,
	FiUser,
} from "react-icons/fi";
import { NavItem } from "../NavItem";
import ChatSidebarToggler from "./ChatSidebarToggler";
import Notifications from "./Notifications";
import Messages from "./Messages";
import { useEffect } from "react";

interface Props {
	forceCollapse: boolean
}


export default function Sidebar({forceCollapse}: Props) {
	const [forceCollapseAtom, setForceCollapse] = useAtom(forceSidebarCollapse);
	const [displayPostButton, setPostButtonDisplay] =
		useAtom(creatorIntersection);

	const { data: session } = useSession();
	const pathname = usePathname();

	const isPostButtonVisible = !displayPostButton && pathname === "/typer";

	const className =
		"flex flex-col gap-8 md:gap-6 w-full items-center md:items-start";

	return (
		<motion.aside
			key='sidebar'
			className={`h-full ${
				forceCollapse ? "" : "md:flex-1 md:px-6"
			} border-r-2 max-md:hidden dark:border-zinc-950 border-black px-3 py-4 flex z-20 justify-end`}
		>
			<div
				className={`w-fit flex flex-col items-end justify-between ${
					forceCollapse ? "" : "md:pr-4"
				}`}
			>
				<div className={className}>
					<NavItem
						name='Home'
						url='/typer'
						forceCollapse={forceCollapse}
					>
						<FiHome size={16} />
					</NavItem>

					<NavItem
						name='Explorar'
						url='/typer'
						forceCollapse={forceCollapse}
					>
						<FiCompass size={16} />
					</NavItem>

					{session?.user && (
						<>
							<Notifications forceCollapse={forceCollapse} />
							<Messages forceCollapse={forceCollapse} />
							<AnimatePresence>
								{isPostButtonVisible && <FloatingPostToggler />}
							</AnimatePresence>
						</>
					)}
				</div>

				<div className={className}>
					{session?.user ? (
						<>
							<NavItem
								name='Perfil'
								url={`/me`}
								forceCollapse={forceCollapse}
							>
								<FiUser size={16} />
							</NavItem>

							<NavItem
								name='Configurações'
								url='/settings'
								forceCollapse={forceCollapse}
							>
								<FiSettings size={16} />
							</NavItem>
						</>
					) : (
						<NavItem
							name='Entrar'
							url='/signin'
							forceCollapse={forceCollapse}
						>
							<FiLogIn />
						</NavItem>
					)}
				</div>
			</div>
		</motion.aside>
	);
}

function FloatingPostToggler() {
	const [forceCollapse, setForceCollapse] = useAtom(forceSidebarCollapse);
	const [isCreatorFloating, setCreatorFloatingState] = useAtom(creatorFloat);

	return (
		<motion.div
			initial={{
				x: -4,
				opacity: 0,
			}}
			animate={{
				x: 0,
				opacity: 1,
			}}
			exit={{
				x: -4,
				opacity: 0,
			}}
		>
			<NavItem
				forceCollapse={forceCollapse}
				name={isCreatorFloating ? "Esconder" : "Novo Post"}
				onClick={() => {
					setCreatorFloatingState(!isCreatorFloating);
				}}
			>
				{isCreatorFloating ? (
					<FiMinimize2 size={16} />
				) : (
					<FiEdit size={16} />
				)}
			</NavItem>
		</motion.div>
	);
}
