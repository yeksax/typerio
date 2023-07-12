"use client";

import { forceSidebarCollapse } from "@/atoms/uiState";
import { useAtom } from "jotai";
import { ReactNode } from "react";

interface Props {
	children: ReactNode;
}

export default function ClientRootLayout({ children }: Props) {
	const [forceCollapse, setForceCollapse] = useAtom(forceSidebarCollapse);

	return (
		<>
			<main
				className={`${
					forceCollapse ? "w-full" : "max-md:flex-1 md:w-[32rem]"
				}`}
			>
				{children}
			</main>
			{!forceCollapse && (
				<aside className='hidden flex-1 md:block border-l-2 dark:border-zinc-950 border-black px-6 py-4'></aside>
			)}
		</>
	);
}
