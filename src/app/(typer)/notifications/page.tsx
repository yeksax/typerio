import { updateUserNotifications } from "@/app/api/util/updateUserNotifications";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { _Notification } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import Notification from "./Notification";

export const dynamic = "force-dynamic";
export const cache = "no-store";
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
			`http://localhost:3000/api/user/${session?.user?.id}/notifications`
		)
	).json();

	await prisma.notification.updateMany({
		where: {
			receiverId: session.user.id,
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
		<div className='flex flex-col'>
			<div className='flex justify-between px-8 py-2 border-b-2 border-black'>
				<div className='font-bold'>Notificações</div>
			</div>
			{notifications.map((notification) => (
				<Notification
					key={notification.id}
					notification={notification}
				/>
			))}
		</div>
	);
}