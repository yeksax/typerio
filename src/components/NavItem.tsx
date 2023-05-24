"use client";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import Link from "next/link";

const linkClass = "hover:font-bold cursor-pointer flex items-center";
const iconClass = "w-6 md:w-5 h-6 md:h-5 grid place-items-center";

export function NavItem({
	name,
	url,
	icon,
	className,
}: {
	name: string;
	icon: IconDefinition;
	url?: string;
	className?: string;
}) {
	if (url)
		return (
			<Link href={url} className={`${linkClass}`}>
				<div className={iconClass}>
					<FontAwesomeIcon
						icon={icon}
						size='xl'
						className={`${className || ""}`}
					/>
				</div>
				<span className='hidden md:block ml-4'>{name}</span>
			</Link>
		);

	return (
		<div className={`${linkClass}`} onClick={() => signOut()}>
			<div className={iconClass}>
				<FontAwesomeIcon
					icon={icon}
					size='xl'
					className={`${className || ""}`}
				/>
			</div>
			<span className='hidden md:block ml-4'>{name}</span>
		</div>
	);
}
