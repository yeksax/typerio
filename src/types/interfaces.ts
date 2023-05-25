import { User, Post } from "@prisma/client";

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
