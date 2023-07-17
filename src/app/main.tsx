"use client";

import { themeAtom } from "@/atoms/appState";
import { forceSidebarCollapse } from "@/atoms/uiState";
import MobileNavigation from "@/components/Navigation/MobileNavigation";
import Sidebar from "@/components/Navigation/Sidebar";
import { Preferences } from "@prisma/client";
import { Analytics } from "@vercel/analytics/react";
import { useAtom } from "jotai";
import { Source_Code_Pro } from "next/font/google";
import { ReactNode } from "react";

interface Props {
	children: ReactNode;
	preferences: Preferences | null;
}
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export default function ClientRootLayout({ children, preferences }: Props) {
	const [forceCollapse, setForceCollapse] = useAtom(forceSidebarCollapse);
	const [theme, setTheme] = useAtom(themeAtom);
	let isDarkMode = false;

	if (typeof window != "undefined") {
		isDarkMode =
			preferences?.theme === "DARK" ||
			((!("theme" in window.localStorage) ||
				preferences?.theme === "SYSTEM_DEFAULT") &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);
	}

	return (
		<>
			<html
				className={`${sourceCodePro.className} ${
					isDarkMode ? "dark" : ""
				}`}
				lang='pt-br'
			>
				<head>
					{theme === "DARK" ||
					(theme === "SYSTEM_DEFAULT" &&
						window.matchMedia("(prefers-color-scheme: dark)")
							.matches) ? (
						<meta name='theme-color' content='#18181a' />
					) : (
						<meta name='theme-color' content='#ffffff' />
					)}
				</head>
				<body className='h-full bg-white dark:bg-zinc-900 text-black dark:text-zinc-200 border-t-2 md:border-none border-black dark:border-zinc-950'>
					<section className='flex h-full overflow-hidden w-full'>
						<Sidebar />
						<MobileNavigation />

						<main
							className={`${
								forceCollapse
									? "w-full"
									: "max-md:flex-1 md:w-[32rem]"
							}`}
						>
							{children}
						</main>
						{!forceCollapse && (
							<aside className='hidden flex-1 md:block border-l-2 dark:border-zinc-950 border-black px-6 py-4'></aside>
						)}
					</section>
					<Analytics />
				</body>
			</html>
		</>
	);
}
