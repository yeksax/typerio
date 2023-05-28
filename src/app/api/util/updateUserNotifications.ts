import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";

export async function updateUserNotifications(target: string){
  const userNotifications = await prisma.notification.count({
    where: {
      receiverId: target,
      isRead: false
    }
  })
  
  await pusherServer.trigger(
    `user__${target}__notifications`,
    "set-notifications",
    userNotifications
  );
}