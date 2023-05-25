import {
	faBell,
	faCompass,
	faHome,
	faRightFromBracket,
	faRightToBracket,
	faUser,
} from "@fortawesome/free-solid-svg-icons";
import { NavItem } from "../NavItem";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { pusherClient } from "@/services/pusher";
import Notifications from "./Notifications";

export default async function Sidebar() {
	const session = await getServerSession(authOptions);

	let notifications = 0;

	if (session?.user?.id) {
		let userNotis = await prisma.user.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				notifications: {
					where: {
						isRead: false,
					},
				},
			},
		});

		if (!userNotis) return;
		notifications = userNotis.notifications.length;
	}

	return (
		<aside
			key='sidebar'
			className={
				"h-full md:flex-1 md:px-6 border-r-2 border-black px-4 py-4 flex justify-end transition-all"
			}
		>
			<div className='w-fit flex flex-col items-end justify-between md:pr-4'>
				<div className='flex flex-col gap-10 md:gap-6 w-full items-center md:items-start'>
					<NavItem name='Home' url='/' icon={faHome} />
					<NavItem name='Explorar' url='/typer' icon={faCompass} />
					{session?.user && (
						<>
							<Notifications notificationCount={notifications}/>
							{/* <NavItem name='Perfil' url='/me' icon={faUser} /> */}
						</>
					)}
				</div>

				<div className='flex flex-col gap-10 md:gap-6 w-full'>
					{session?.user ? (
						<NavItem
							name='Sair'
							icon={faRightToBracket}
							url='/signout'
						/>
					) : (
						<NavItem
							name='Entrar'
							url='/signin'
							icon={faRightFromBracket}
						/>
					)}
				</div>
			</div>
		</aside>
	);
}
