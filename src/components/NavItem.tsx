"use client";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const linkClass =
	"hover:font-bold cursor-pointer text-sm font-medium transition-all duration-200 flex items-center";
const iconClass = "w-5 h-5 md:w-4 md:h-4 grid place-items-center relative";

export function NavItem({
	name,
	url,
	icon,
	className,
	blob,
}: {
	name: string;
	icon: IconDefinition;
	url?: string;
	className?: string;
	blob?: string | number;
}) {
	const child = (
		<>
			<div className={iconClass}>
				<FontAwesomeIcon
					icon={icon}
					size='xl'
					className={`${className || "w-full h-full"}`}
				/>
				{blob !== undefined && blob !== 0 && (
					<div className='absolute text-center bottom-1/2 left-1/2 z-10 w-4 h-4 text-xs text-white rounded-full bg-red-500'>
						{blob}
					</div>
				)}
			</div>
			<span className='hidden md:block ml-4'>{name}</span>
		</>
	);

	const [hover, setHover] = useState(false);

	if (url)
		return (
			<motion.div
				className='w-full'
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				animate={{
					x: hover ? 5 : 0,
				}}
			>
				<Link href={url} className={`${linkClass}`}>
					{child}
				</Link>
			</motion.div>
		);

	return (
		<div className={`${linkClass}`} onClick={() => signOut()}>
			{child}
		</div>
	);
}
