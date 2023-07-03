import { pusherServer } from "@/services/pusher";

export async function updatePercent(channel: string, percent: number) {
	await pusherServer.trigger(channel, "progress", percent);
}
