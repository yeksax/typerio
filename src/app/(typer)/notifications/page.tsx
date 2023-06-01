import { updateUserNotifications } from "@/app/api/util/updateUserNotifications";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Notification } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import Notification from "./Notification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
	title: "Notificações",
};

export default async function Page() {
	"use server";
	const session = await getServerSession(authOptions);

	if (!session?.user) return <></>;

	let notifications: _Notification[] = await (
		await fetch(
			`${process.env.PAGE_URL}/api/user/${session?.user?.id}/notifications`,
			{
				cache: "no-store",
			}
		)
	).json();

	await prisma.notification.updateMany({
		where: {
			receiverId: session.user.id,
			isRead: false,
		},
		data: {
			isRead: true,
		},
	});

	await updateUserNotifications(session.user.id);

	await fetch(process.env.PAGE_URL! + "/api/pusher/notifications/clear", {
		method: "POST",
		body: JSON.stringify({
			user: session.user.id,
		}),
	});

	return (
		<div className='flex flex-col h-full'>
			<div className='flex justify-between px-8 py-2 border-b-2 border-black'>
				<div className='font-bold'>Notificações</div>
			</div>
			<div className='flex flex-col h-full overflow-scroll'>
				{notifications.map((notification) => (
					<Notification
						key={notification.id}
						notification={notification}
					/>
				))}
			</div>
		</div>
	);
}
