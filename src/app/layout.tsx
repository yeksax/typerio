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
		<html className={sourceCodePro.className} lang='en'>
			<SessionProvider>
				<body className='pt-20'>
					<Navigation />
					{children}
				</body>
			</SessionProvider>
		</html>
	);
}
