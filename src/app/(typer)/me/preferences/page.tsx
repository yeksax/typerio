import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import Preferences from "./preferences";

export const metadata = {
	title: "Configurações",
};


export default async function PreferencesPage() {
	const session = await getServerSession(authOptions);

	let user = await prisma.user.findUnique({
		where: {
			id: session!.user!.id,
		},
		include: {
			preferences: true,
		},
	});

	if (!user?.preferences) {
		user = await prisma.user.update({
			where: {
				id: session!.user!.id,
			},
			data: {
				preferences: {
					create: {},
				},
			},
			include: {
				preferences: true,
			},
		});
	}

	return (
		<Preferences preferences={user.preferences!}/>
	);
}

function SectionTitle({ children }: { children: ReactNode }) {
	return (
		<div className='flex gap-2 items-center md:gap-4 px-4 md:px-8 py-2 text-sm font-medium'>
			{children}
		</div>
	);
}
