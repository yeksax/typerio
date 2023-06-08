// import { pusherServer } from "@/services/pusher";
// import { _Chat, _ChatHistory } from "@/types/interfaces";

// export async function POST(
// 	req: Request,
// 	{
// 		params,
// 	}: {
// 		params: { id: string };
// 	}
// ) {
// 	const { chat }: { chat: _Chat } = await req.json();
//   const newChat = getNewChat(chat, params.id)

//   console.log(`${params.id}__chats`, newChat)

// 	pusherServer.trigger(
// 		`${params.id}__chats`,
// 		"new-chat",
// 		newChat
// 	);
// }
