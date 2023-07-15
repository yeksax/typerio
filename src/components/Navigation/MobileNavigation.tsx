"use client";

import Link from "next/link";
import { FiBell, FiCompass, FiHome, FiMail, FiSettings, FiUser } from "react-icons/fi";

interface Props {}

export default function MobileNavigation({}: Props) {
	return (
		<div className='fixed items-center flex justify-between border-t-2 border-black dark:border-zinc-950 gap-4 bottom-0 left-0 w-full bg-white dark:bg-zinc-900 px-6 h-12 text-xl z-40 md:hidden'>
			<Link href='/settings'>
				<FiSettings />
			</Link>

			<Link href='/notifications'>
				<FiBell />
			</Link>

      <Link href='/typer'>
				<FiCompass />
			</Link>

			<Link href='/typos'>
				<FiMail />
			</Link>

			<Link href='/me'>
				<FiUser />
			</Link>
		</div>
	);
}
