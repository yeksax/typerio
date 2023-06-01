import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

interface Props {}

export default function Navigation({}: Props) {
	const { data: session } = useSession();

	const linkCss = "hover:font-semibold transition-all";

	return (
		<header
			className={`px-3 h-12 md:px-8 md:h-16 flex justify-between items-center border-b-2 border-b-black fixed top-0 left-0 w-full glass`}
		>
			<Link href='/' className='text-2xl upercase font-extrabold flex-1 flex items-top'>
				TYPER<span className="ml-1 font-semibold text-sm">BETA</span>
			</Link>
			<nav className='hidden md:flex gap-12'></nav>
			<nav className='flex-1 flex justify-end'>
				{!session && <Link href='/signin'></Link>}
			</nav>
		</header>
	);
}
