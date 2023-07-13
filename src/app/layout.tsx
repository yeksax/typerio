import Sidebar from "@/components/Sidebar/Sidebar";
import { Analytics } from "@vercel/analytics/react";
import { Source_Code_Pro } from "next/font/google";
import "./globals.scss";
import Providers from "./providers";
import ClientRootLayout from "./main";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";


export const metadata: Metadata = {
	metadataBase: new URL("https://acme.com"),
	title: {
		template: "Typer | %s",
		default: "Typer",
	},
	manifest: "/manifest.json",
	themeColor: "#ffffff",
	description: "Compartilhe suas minimas ideias :)",
	twitter: {
		title: "Typer",
		description: "Um minimo app :)",
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	let preferences = await prisma.preferences.findFirst({
		where: {
			userID: session?.user?.id,
		},
	});

	return (
		<Providers>
			<ClientRootLayout preferences={preferences}>{children}</ClientRootLayout>
		</Providers>
	);
}
