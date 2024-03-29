import {
	Chat,
	File,
	Message,
	Notification,
	NotificationActors,
	Post,
	Preferences,
	User,
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
	author: User & {
		followers?: {
			id: string;
		}[];
	};
	likedBy: {
		id: string;
	}[];

	thread?: _Post[];
	attachments?: File[];

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

export interface _Chat extends Chat {
	members: User[];
	messages: _Message[];
	_count?: {
		members: number;
	};
	silencedBy?: {
		id: string;
	}[];
	fixedBy?: {
		id: string;
	}[];
}

export interface _User extends User {
	posts?: Post[];
	following?: User[];
	followers?: User[];
	pinnedPost?: Post | null;
	preferences?: Preferences;
	_count: {
		chats?: number;
		posts?: number;
		likedPosts?: number;
		following?: number;
		followers?: number;
	};
}

export interface _ChatHistory {
	id: string;
	name: string;
	description: string;
	thumbnail: string;
	lastMessage: {
		content: string;
		author: string;
		timestamp: Date;
	};
	memberCount: number;
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
	readBy?: {
		id: string;
	}[];
}

export interface URLMetadata {
	description?: string;
	image?: string;
	title?: string;
	url?: string;
}
