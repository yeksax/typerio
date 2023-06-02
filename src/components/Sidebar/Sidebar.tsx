import { authOptions } from "@/services/auth";
import {
	faCompass,
	faEnvelope,
	faHome,
	faMessage,
	faRightFromBracket,
	faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { getServerSession } from "next-auth";
import { NavItem } from "../NavItem";
import Notifications from "./Notifications";
import { FiBell } from "react-icons/fi";
import { useChat } from "@/contexts/ChatContext";
import ChatSidebarToggler from "./ChatSidebarToggler";

interface Props {
	forceCollapse?: boolean;
	hasChatSidebar?: boolean;
}

export default async function Sidebar({
	forceCollapse,
	hasChatSidebar,
}: Props) {
	let chat;

	const session = await getServerSession(authOptions);

	return (
		<aside
			key='sidebar'
			className={`h-full ${
				forceCollapse ? "" : "md:flex-1 md:px-6"
			} border-r-2 border-black px-4 py-4 flex z-20 bg-white justify-end transition-all`}
		>
			<div
				className={`w-fit flex flex-col items-end justify-between ${
					forceCollapse ? "" : "md:pr-4"
				}`}
			>
				<div className='flex flex-col gap-10 md:gap-6 w-full items-center md:items-start'>
					<NavItem
						forceCollapse={forceCollapse}
						name='Home'
						url='/'
						icon={faHome}
					/>
					<NavItem
						forceCollapse={forceCollapse}
						name='Explorar'
						url='/typer'
						icon={faCompass}
					/>
					{session?.user && (
						<>
							<Notifications forceCollapse={forceCollapse} />
							{hasChatSidebar ? (
								<ChatSidebarToggler
									forceCollapse={forceCollapse}
								/>
							) : (
								<NavItem
									forceCollapse={forceCollapse}
									name='Mensagens'
									url='/typos'
									icon={faEnvelope}
								/>
							)}
						</>
					)}
					{/* <NavItem 								forceCollapse={forceCollapse}
 name='Perfil' url='/me' icon={faUser} /> */}
				</div>

				<div className='flex flex-col gap-10 md:gap-6 w-full'>
					{session?.user ? (
						<NavItem
							forceCollapse={forceCollapse}
							name='Sair'
							icon={faRightFromBracket}
							url='/signout'
						/>
					) : (
						<NavItem
							forceCollapse={forceCollapse}
							name='Entrar'
							url='/signin'
							icon={faRightToBracket}
						/>
					)}
				</div>
			</div>
		</aside>
	);
}
