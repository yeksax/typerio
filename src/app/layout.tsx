"use client";

import { SessionProvider, useSession } from "next-auth/react";
import "./globals.scss";
import { Source_Code_Pro } from "next/font/google";
import Navigation from "@/components/Navigation";
import { Analytics } from "@vercel/analytics/react";
import NotificationsProvider from "@/contexts/NotificationContext";
import UserProvider from "@/contexts/UserContext";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html className={sourceCodePro.className} lang='pt-br'>
			<SessionProvider>
				<UserProvider>
					<NotificationsProvider>
						<body className='pt-12 md:pt-16 h-full bg-white'>
							<Navigation />
							{children}
							<Analytics />
						</body>
					</NotificationsProvider>
				</UserProvider>
			</SessionProvider>
		</html>
	);
}
