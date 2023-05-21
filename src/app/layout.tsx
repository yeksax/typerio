"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.scss";
import { Source_Code_Pro } from "next/font/google";
import Navigation from "@/components/Navigation";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html className={sourceCodePro.className} lang='pt-br'>
			<SessionProvider>
				<body className='pt-20 h-full bg-white'>
					<Navigation />
					{children}
				</body>
			</SessionProvider>
		</html>
	);
}
