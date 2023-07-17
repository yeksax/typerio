import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.scss";
import ClientRootLayout from "./main";
import Providers from "./providers";


export const metadata: Metadata = {
	metadataBase: new URL("https://acme.com"),
	title: {
		template: "%s | Typer",
		default: "Typer",
	},
	manifest: "/manifest.json",
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
