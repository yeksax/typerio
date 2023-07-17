"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBell, FiCompass, FiMail, FiSettings, FiUser } from "react-icons/fi";

interface Props {}

export default function MobileNavigation({}: Props) {
	const path = usePathname();

	const shouldBeVertical = path.startsWith("/typos/");

	return (
		<motion.div
			layout
			className={`${
				shouldBeVertical
					? "bottom-16 px-4 pb-2"
					: "w-full bottom-4 px-8"
			} fixed z-40`}
		>
			<motion.div
				drag
				dragSnapToOrigin
				className={`${
					shouldBeVertical
						? "flex-col w-fit h-fit px-3 py-3 border-r-2 gap-8 left-4 "
						: "px-6 w-full h-12 gap-4 text-lg"
				} items-center flex justify-between border-4 border-t-2 rounded-md border-black dark:border-zinc-950 bg-white dark:bg-zinc-900 md:hidden `}
			>
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
			</motion.div>
		</motion.div>
	);
}
