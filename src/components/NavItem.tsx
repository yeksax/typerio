"use client";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

const linkClass =
	"hover:font-semibold nav-item cursor-pointer text-sm font-medium transition-all duration-200 flex items-center h-5";
const iconClass = "w-5 h-5 md:w-4 md:h-4 grid place-items-center relative";

export function NavItem({
	name,
	url,
	icon,
	blob,
	forceCollapse,
	children,
}: {
	name: string;
	icon?: IconDefinition;
	url?: string;
	blob?: string | number;
	forceCollapse?: boolean;
	children?: ReactNode;
}) {
	const child = (
		<motion.div
			className='w-full flex items-center'
		>
			<div className={iconClass}>
				{icon && (
					<FontAwesomeIcon
						icon={icon}
						className={`${"w-full h-full aspect-square"}`}
					/>
				)}
				{children && children}
				{blob !== undefined && blob !== 0 && (
					<div className='absolute text-center font-normal hover:font-normal bottom-1/2 left-1/2 z-10 w-4 h-4 text-xs text-white rounded-full bg-red-500'>
						{blob}
					</div>
				)}
			</div>
			<span className={`hidden ${forceCollapse ? "" : "md:block"} ml-4`}>
				{name}
			</span>
		</motion.div>
	);

	return url ? (
		<Link prefetch={false} href={url} className={`${linkClass}`}>
			{child}
		</Link>
	) : (
		<div className={`${linkClass}`}>{child}</div>
	);
}
