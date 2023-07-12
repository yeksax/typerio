"use client";

import { themeAtom } from "@/atoms/appState";
import Sidebar from "@/components/Sidebar/Sidebar";
import ChatProvider from "@/hooks/ChatContext";
import NotificationsProvider from "@/hooks/NotificationContext";
import UserProvider from "@/hooks/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { useAtom } from "jotai";
import { SessionProvider } from "next-auth/react";
import { Source_Code_Pro } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "./globals.scss";
import { Metadata } from "next";
import { unreadMessagesAtom, unreadNotificationsAtom } from "@/atoms/notificationsAtom";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

const collapseMatch = ["/signout", "/signin", "/typos", "/invite"];

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [theme, setTheme] = useAtom(themeAtom);
	const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);
	const [unreadNotifications, setUnreadNotifications] = useAtom(
		unreadNotificationsAtom
	);
	const pathname = usePathname();

	let forceCollapse = false;
	if (pathname === "/") forceCollapse = true;

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	});

	collapseMatch.forEach((path) => {
		if (pathname.startsWith(path)) forceCollapse = true;
	});

	useEffect(() => {
		let allNotifications =
			unreadMessages +
			unreadNotifications.filter((n) => !n.isRead).length;
		let regex = /\([0-9]{1,2}\+?\) /;
		let title = document.title.replace(regex, "");

		if (title.length == 0) return;

		if (allNotifications > 99) document.title = `(99+) ${title}`;
		else if (allNotifications > 0)
			document.title = `(${allNotifications}) ${title}`;
		else document.title = `${title}`;
	}, [pathname, unreadMessages, unreadNotifications]);

	function dataDragHandler(ev: DragEvent) {
		ev.preventDefault();

		let files = ev.dataTransfer?.files;
		if (!files) return;

		for (let i = 0; i < files.length; i++) {
			console.log(files.item(i));
		}
	}

	useEffect(() => {
		document.addEventListener("dragover", dataDragHandler);

		return () => {
			document.removeEventListener("dragover", dataDragHandler);
		};
	}, []);

	useEffect(() => {
		let storedTheme = localStorage.getItem("theme");

		if (!storedTheme && theme === "") {
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
				localStorage.setItem("theme", "SYSTEM_DEFAULT");
				setTheme("SYSTEM_DEFAULT");
			}
		} else if (theme === "") {
			if (storedTheme === "DARK")
				document.documentElement.classList.add("dark");
			if (storedTheme === "LIGHT")
				document.documentElement.classList.remove("dark");
			if (storedTheme === "SYSTEM_DEFAULT")
				if (window.matchMedia("(prefers-color-scheme: dark)").matches)
					document.documentElement.classList.add("dark");
				else document.documentElement.classList.remove("dark");
		} else {
			if (theme === "DARK")
				document.documentElement.classList.add("dark");
			if (theme === "LIGHT")
				document.documentElement.classList.remove("dark");
			if (theme === "SYSTEM_DEFAULT")
				if (window.matchMedia("(prefers-color-scheme: dark)").matches)
					document.documentElement.classList.add("dark");
				else document.documentElement.classList.remove("dark");
		}
	}, [theme, pathname]);

	return (
		<html className={`${sourceCodePro.className}`} lang='pt-br'>
			<SessionProvider refetchOnWindowFocus={false}>
				<QueryClientProvider client={queryClient}>
					<UserProvider>
						<NotificationsProvider>
							<ChatProvider>
								<head>
									<link
										rel='manifest'
										href='/manifest.json'
									/>
									<meta
										name='theme-color'
										content='#000000'
									/>
								</head>
								<body className='h-full bg-white dark:bg-zinc-900 text-black dark:text-zinc-200'>
									{/* <Navigation /> */}
									<section className='flex h-full overflow-hidden w-full'>
										{/* @ts-ignore */}
										<Sidebar
											forceCollapse={forceCollapse}
											hasChatSidebar={pathname.startsWith(
												"/typos"
											)}
										/>
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
							</ChatProvider>
						</NotificationsProvider>
					</UserProvider>
				</QueryClientProvider>
			</SessionProvider>
		</html>
	);
}
