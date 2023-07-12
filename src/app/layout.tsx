import Sidebar from "@/components/Sidebar/Sidebar";
import { Analytics } from "@vercel/analytics/react";
import { Source_Code_Pro } from "next/font/google";
import "./globals.scss";
import Providers from "./providers";
import ClientRootLayout from "./main";
import { Metadata } from "next";

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		template: "Typer / %s",
		default: "Typer",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Providers>
			<html className={`${sourceCodePro.className}`} lang='pt-br'>
				<head>
					<link rel='manifest' href='/manifest.json' />
					<meta name='theme-color' content='#000000' />
				</head>
				<body className='h-full bg-white dark:bg-zinc-900 text-black dark:text-zinc-200'>
					<section className='flex h-full overflow-hidden w-full'>
						<Sidebar />
						<ClientRootLayout>{children}</ClientRootLayout>
					</section>
					<Analytics />
				</body>
			</html>
		</Providers>
	);
}
