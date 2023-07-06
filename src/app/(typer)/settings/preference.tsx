"use client";

import { ReactNode } from "react";

interface Props {
	title: string;
	description: string;
	children: ReactNode;
	icon?: ReactNode;
	tabbed?: boolean;
}

export default function Preference({
	children,
	tabbed,
	description,
	title,
	icon,
}: Props) {
	return (
		<div
			className={`${
				tabbed ? "pl-8 mt-0 md:pl-12" : "mt-4"
			} flex gap-2 md:gap-4 px-4 md:px-8 h-fit w-full`}
		>
			{icon}
			<div className='flex flex-col flex-1 gap-1'>
				<div className='font-semibold text-sm items-end flex justify-between'>
					{title}
					<div className='text-xs flex justify-end w-max'>
						{children}
					</div>
				</div>
				<h5 className='text-xs text-gray-600 dark:text-zinc-400 line-clamp-1 break-all'>
					{description}
				</h5>
			</div>
		</div>
	);
}
