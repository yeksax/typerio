import { NavItem } from "@/components/NavItem";
import Sidebar from "@/components/Sidebar";
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
	return (
		<section className='flex h-full overflow-hidden'>
			{/* @ts-ignore */}
			<Sidebar/>
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
