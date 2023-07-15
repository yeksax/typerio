import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import Notifications from "./Notifications";
import PageTitle from "@/components/PageTitle";

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
			<PageTitle title='Notificações' />
			<Notifications />
		</div>
	);
}
