"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";
import { FiChevronLeft } from "react-icons/fi";

interface Props {}

export function SectionTitle({
	children,
	back,
}: {
	children: ReactNode;
	back?: boolean;
}) {
	const router = useRouter();

	return (
		<div className='border-b-2 flex items-center gap-2 md:gap-4 border-black px-4 md:px-8 text-base font-semibold py-1 md:py-2'>
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
