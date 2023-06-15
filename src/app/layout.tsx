"use client";

import Navigation from "@/components/Navigation";
import ChatProvider from "@/contexts/ChatContext";
import NotificationsProvider from "@/contexts/NotificationContext";
import UserProvider from "@/contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { Source_Code_Pro } from "next/font/google";
import "./globals.scss";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			}
		}
	});

	return (
		<html className={sourceCodePro.className} lang='pt-br'>
			<SessionProvider>
				<UserProvider>
					<NotificationsProvider>
						<ChatProvider>
							<QueryClientProvider client={queryClient}>
								{/* @ts-ignore */}
								<body className='pt-12 md:pt-16 h-full bg-white'>
									<Navigation />
									{children}
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
