"use client";

import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import ChatProvider from "@/hooks/ChatContext";
import NotificationsProvider from "@/hooks/NotificationContext";
import UserProvider from "@/hooks/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { Source_Code_Pro } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.scss";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

const collapseMatch = ["/signout", "/signin", "/typos", "/invite"];

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	});

	const pathname = usePathname();
	let forceCollapse = false;

	collapseMatch.forEach((path) => {
		if (pathname.startsWith(path)) forceCollapse = true;
	});

	if (pathname === "/") forceCollapse = true;

	return (
		<html className={sourceCodePro.className} lang='pt-br'>
			<SessionProvider refetchOnWindowFocus={false}>
				<UserProvider>
					<NotificationsProvider>
						<ChatProvider>
							<QueryClientProvider client={queryClient}>
								<body className='pt-12 md:pt-16 h-full bg-white'>
									<Navigation />
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
											<aside className='hidden flex-1 md:block border-l-2 border-black px-6 py-4'></aside>
										)}
									</section>
									<Analytics />
								</body>
							</QueryClientProvider>
						</ChatProvider>
					</NotificationsProvider>
				</UserProvider>
			</SessionProvider>
		</html>
	);
}
