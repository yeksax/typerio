import { User, Post, Notification, NotificationActors } from "@prisma/client";

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

export interface _User extends User {}
