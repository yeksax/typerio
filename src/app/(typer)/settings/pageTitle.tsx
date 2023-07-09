"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
import { FiChevronLeft } from "react-icons/fi";

interface Props {}

export function SectionTitle({
	children,
	back,
	className,
}: {
	children: ReactNode;
	back?: boolean;
	className?: string;
}) {
	const router = useRouter();

	return (
		<div
			className={`${
				className ? className : "px-4 md:px-8"
			} border-b-2 flex items-center gap-2 md:gap-4 dark:border-zinc-950 border-black text-base font-semibold py-1 md:py-2`}
		>
			{back && (
				<FiChevronLeft
					className='cursor-pointer'
					onClick={() => router.back()}
					size={16}
				/>
			)}
			{children}
		</div>
	);
}
