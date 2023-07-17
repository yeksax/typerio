"use client";

import { forceSidebarCollapse } from "@/atoms/uiState";
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import Link from "next/link";
import { MouseEvent, ReactNode } from "react";

const linkClass =
	"w-full hover:font-semibold nav-item cursor-pointer text-sm transition-[font-weight] font-medium flex items-center h-5";
const iconClass = "w-5 h-5 md:w-4 md:h-4 grid place-items-center relative";

export function NavItem({
	name,
	url,
	forceCollapse,
	icon,
	blob,
	onClick,
	children,
}: {
	name: string;
	icon?: IconDefinition;
	url?: string;
	blob?: string | number;
	onClick?: (e: MouseEvent) => void;
	forceCollapse: boolean;
	children?: ReactNode;
}) {
	const child = (
		<motion.div className='w-full flex items-center'>
			<div className={iconClass}>
				{icon && (
					<FontAwesomeIcon
						icon={icon}
						className={`${"w-full h-full aspect-square"}`}
					/>
				)}
				{children && children}
				{blob !== undefined && blob !== 0 && (
					<div
						className='absolute grid place-items-center font-normal hover:font-normal bottom-1/2 left-1/2 z-10 h-0 w-fit py-2 p-1.5 text-xxs text-white rounded-full bg-red-500'
						style={{
							lineHeight: 0,
						}}
					>
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
		<div onClick={onClick} className={`${linkClass}`}>
			{child}
		</div>
	);
}
