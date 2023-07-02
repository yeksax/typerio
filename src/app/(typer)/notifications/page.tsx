import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import Notifications from "./Notifications";

export const metadata = {
	title: "Notificações",
};

export default async function Page() {
	"use server";
	const session = await getServerSession(authOptions);

	if (!session) return;
	if (!session.user) return;

	await prisma.notification.updateMany({
		where: {
			receiverId: session.user.id,
			isRead: false,
		},
		data: {
			isRead: true,
		},
	});

	return (
		<div className='flex flex-col h-full'>
			<div className='border-b-2 border-black px-4 md:px-8 text-base font-semibold py-1 md:py-2'>
				Notificações
			</div>
			<Notifications />
		</div>
	);
}
