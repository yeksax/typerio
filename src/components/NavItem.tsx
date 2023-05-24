"use client";

import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import Link from "next/link";

const linkClass = "hover:font-bold cursor-pointer flex items-center";
const iconClass = "w-6 md:w-5 aspect-square";

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
				<FontAwesomeIcon
					icon={icon}
					size='xl'
					className={`${iconClass} ${className}`}
				/>
				<span className='hidden md:block ml-4'>{name}</span>
			</Link>
		);

	return (
		<div className={`${linkClass}`} onClick={() => signOut()}>
			<FontAwesomeIcon
				icon={icon}
				size='xl'
				className={`${iconClass} ${className}`}
			/>
			<span className='hidden md:block ml-4'>{name}</span>
		</div>
	);
}
