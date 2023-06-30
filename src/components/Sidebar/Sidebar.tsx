import { useSession } from "next-auth/react";
import { FiCompass, FiHome, FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import { NavItem } from "../NavItem";
import ChatSidebarToggler from "./ChatSidebarToggler";
import Messages from "./Messages";
import Notifications from "./Notifications";

interface Props {
	forceCollapse?: boolean;
	hasChatSidebar?: boolean;
}

export default function Sidebar({ forceCollapse, hasChatSidebar }: Props) {
	const { data: session } = useSession();

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
					<NavItem forceCollapse={forceCollapse} name='Home' url='/'>
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
							{hasChatSidebar ? (
								<ChatSidebarToggler
									forceCollapse={forceCollapse}
								/>
							) : (
								<Messages
									session={session}
									forceCollapse={forceCollapse}
								/>
							)}
							<NavItem
								forceCollapse={forceCollapse}
								name='Perfil'
								url='/me'
							>
								<FiUser size={16} />
							</NavItem>
						</>
					)}
				</div>

				<div className='flex flex-col gap-10 md:gap-6 w-full'>
					{session?.user ? (
						<NavItem
							forceCollapse={forceCollapse}
							name='Sair'
							url='/signout'
						>
							<FiLogOut />
						</NavItem>
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
		</aside>
	);
}
