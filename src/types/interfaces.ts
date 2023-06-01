import {
	User,
	Post,
	Notification,
	NotificationActors,
	Chat,
	Message,
} from "@prisma/client";

export interface PostButtonProps {
	id: string;
	user: string;
	value: number;
	iconClass?: string;
	className?: string;
}

export interface _Post extends Post {
	_count: {
		replies: number;
		likedBy: number;
	};
	author: User;
	likedBy: {
		id: string;
	}[];

	thread?: _Post[];

	replies?: _Post[];
	replied?:
		| (Post & {
				author: User;
		  })
		| null;
}

export interface _NotificationActors extends NotificationActors {
	users: User[];
}

export interface _Notification extends Notification {
	notificationActors?: _NotificationActors | null | undefined;
}

export interface _Chat extends Chat {}

export interface _User extends User {}

export interface _ChatHistory {
	id: string;
	name: string;
	thumbnail: string;
	lastMessage: {
		content: string;
		author: string;
		timestamp: Date;
	};
	type: "DIRECT_MESSAGE" | "GROUP_CHAT";
	unreadMessages: number;
	messages: _Message[];
}

export interface _Message extends Message {
	author: User;
	mention:
		| (Message & {
				author: User | null;
		  })
		| null;
	readBy: {
		id: string
	}[];
}
