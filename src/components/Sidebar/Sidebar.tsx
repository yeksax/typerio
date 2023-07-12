'use client'

import { creatorFloat, creatorIntersection } from "@/atoms/creatorAtom";
import { forceSidebarCollapse } from "@/atoms/uiState";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import {
	FiCompass,
	FiEdit,
	FiHome,
	FiLogIn,
	FiMinimize2,
	FiSettings,
	FiUser
} from "react-icons/fi";
import { NavItem } from "../NavItem";
import ChatSidebarToggler from "./ChatSidebarToggler";
import Messages from "./Messages";
import Notifications from "./Notifications";

interface Props {}

const collapseMatch = ["/signout", "/signin", "/typos", "/invite"];

export default function Sidebar({}: Props) {
	const [forceCollapse, setForceCollapse] = useAtom(forceSidebarCollapse);
	const { data: session } = useSession();
	const pathname = usePathname();
	const [displayPostButton, setPostButtonDisplay] =
		useAtom(creatorIntersection);
	const [isCreatorFloating, setCreatorFloatingState] = useAtom(creatorFloat);

	const isPostButtonVisible = !displayPostButton && pathname === "/typer";

	useEffect(() => {
		setForceCollapse(false);
		if (pathname === "/") setForceCollapse(true);

		collapseMatch.forEach((path) => {
			if (pathname.startsWith(path)) setForceCollapse(true);
		});
	}, [pathname]);

	return (
		<motion.aside
			key='sidebar'
			className={`h-full ${
				forceCollapse ? "" : "md:flex-1 md:px-6"
			} border-r-2 dark:border-zinc-950 border-black px-3 py-4 flex z-20 justify-end`}
		>
			<div
				className={`w-fit flex flex-col items-end justify-between ${
					forceCollapse ? "" : "md:pr-4"
				}`}
			>
				<div className='flex flex-col gap-8 md:gap-6 w-full items-center md:items-start'>
					<NavItem
						forceCollapse={forceCollapse}
						name='Home'
						url='/typer'
					>
						<FiHome size={16} />
					</NavItem>
					<NavItem
						forceCollapse={forceCollapse}
						name='Explorar'
						url='/typer'
					>
						<FiCompass size={16} />
					</NavItem>
					{session?.user && (
						<>
							<Notifications forceCollapse={forceCollapse} />
							{pathname.startsWith("/typos") && !isMobile ? (
								<>
									<ChatSidebarToggler
										forceCollapse={forceCollapse}
									/>
								</>
							) : (
								<Messages
									session={session}
									forceCollapse={forceCollapse}
								/>
							)}
							<AnimatePresence>
								{isPostButtonVisible && (
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
											name={
												isCreatorFloating
													? "Esconder"
													: "Novo Post"
											}
											forceCollapse={forceCollapse}
											onClick={() => {
												setCreatorFloatingState(
													!isCreatorFloating
												);
											}}
										>
											{isCreatorFloating ? (
												<FiMinimize2 size={16} />
											) : (
												<FiEdit size={16} />
											)}
										</NavItem>
									</motion.div>
								)}
							</AnimatePresence>
						</>
					)}
				</div>

				<div className='flex flex-col gap-8 md:gap-6 w-full'>
					{session?.user ? (
						<>
							<NavItem
								forceCollapse={forceCollapse}
								name='Perfil'
								url={`/me`}
							>
								<FiUser size={16} />
							</NavItem>
							<NavItem
								forceCollapse={forceCollapse}
								name='Configurações'
								url='/settings'
							>
								<FiSettings size={16} />
							</NavItem>
						</>
					) : (
						<NavItem
							forceCollapse={forceCollapse}
							name='Entrar'
							url='/signin'
						>
							<FiLogIn />
						</NavItem>
					)}
				</div>
			</div>
		</motion.aside>
	);
}
