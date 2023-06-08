import { _Chat, _ChatHistory } from "@/types/interfaces";

export function parseChatHistory(chat: _Chat[], user: string): _ChatHistory[] {
  let sortedChats = chat.sort((a, b) => {
    if (
      a.messages[a.messages.length - 1].createdAt <
      b.messages[b.messages.length - 1].createdAt
    ) {
      return 1;
    } else {
      return -1;
    }
  })

  return sortedChats.map((chat) => {
    let dmReceiver: string | undefined;
    let dmReceiverAvatar: string | undefined;
  
    if (chat.type == "DIRECT_MESSAGE") {
      let target = chat.members.find(
        (m) => m.id != user
      );
      dmReceiver = target!.name;
      dmReceiverAvatar = target!.profilePicture;
    }
  
    return {
      id: chat.id,
      name: dmReceiver || chat.name,
      type: chat.type,
      memberCount: chat._count!.members,
      description: chat.description,
      thumbnail: dmReceiverAvatar || chat.thumbnail,
      lastMessage: {
        content: chat.messages[chat.messages.length - 1]?.content,
        timestamp:
          chat.messages[chat.messages.length - 1]?.createdAt,
        author: chat.messages[chat.messages.length - 1]?.author
          .name,
      },
      unreadMessages: chat.messages.filter(
        (message) =>
          !message.readBy!.some(
            (readBy) => readBy.id === user
          )
      ).length,
      messages: chat.messages,
    };
  });
}