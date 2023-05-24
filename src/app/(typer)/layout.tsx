import { NavItem } from "@/components/NavItem";
import { authOptions } from "@/services/auth";
import {
	faBell,
	faCompass,
	faHome,
	faPerson,
	faRightFromBracket,
	faRightToBracket,
	faSignIn,
	faUser,
} from "@fortawesome/free-solid-svg-icons";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";

export const fetchCache = "no-store";
export const dynamic = "force-dynamic";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	return (
		<section className='flex h-full overflow-hidden'>
			<aside className='md:flex-1 border-r-2 border-black px-3 py-4 md:px-6 flex justify-end'>
				<div className='w-fit flex flex-col items-end justify-between md:pr-4'>
					<div className='flex flex-col gap-6 w-full items-center md:items-start'>
						<NavItem name='Home' url='/' icon={faHome} />
						<NavItem
							name='Explorar'
							url='/typer'
							icon={faCompass}
						/>
						<NavItem
							name='Notificações'
							url='/notifications'
							className='w-5'
							icon={faBell}
						/>
						<NavItem name='Perfil' url='/me' icon={faUser} />
						{session?.user && <></>}
					</div>

					<div className='flex flex-col gap-6 w-full'>
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
			<main
				className='h-full flex flex-col flex-1'
				style={{
					minWidth: "45%",
				}}
			>
				{/* @ts-ignore */}
				{children}
			</main>
			<aside className='hidden md:flex-1 md:block flex-1 border-l-2 border-black px-6 py-4'></aside>
		</section>
	);
}
