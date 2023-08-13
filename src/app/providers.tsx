"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { themeAtom } from "@/atoms/appState";
import {
	unreadMessagesAtom,
	notificationsAtom,
} from "@/atoms/notificationsState";
import { useAtom } from "jotai";
import { ReactNode } from "react";
import ChatProvider from "@/hooks/ChatContext";
import NotificationsProvider from "@/hooks/NotificationContext";
import UserProvider from "@/hooks/UserContext";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: ReactNode }) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	});

	const [theme, setTheme] = useAtom(themeAtom);
	const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);
	const [unreadNotifications, setUnreadNotifications] = useAtom(
		notificationsAtom
	);
	const pathname = usePathname();

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
		<SessionProvider refetchOnWindowFocus={false}>
			<QueryClientProvider client={queryClient}>
				<UserProvider>
					<NotificationsProvider>
						<ChatProvider>{children}</ChatProvider>
					</NotificationsProvider>
				</UserProvider>
			</QueryClientProvider>
		</SessionProvider>
	);
}
