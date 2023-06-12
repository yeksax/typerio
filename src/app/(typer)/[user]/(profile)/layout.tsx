import Sidebar from "@/components/Sidebar/Sidebar";
import Link from "next/link";
import Profile from "./Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { ReactNode } from "react";
import { prisma } from "@/services/prisma";

interface Props {
	children: ReactNode;
	params: {
		user: string;
	};
}

export default async function ExploreLayout({ children, params }: Props) {
	const session = await getServerSession(authOptions);

	const user = await prisma.user.findUnique({
		where:
			params.user == "me"
				? { id: session?.user?.id }
				: { username: params.user },
		include: {
			_count: {
				select: {
					chats: true,
					posts: true,
					followers: true,
					following: true,
					likedPosts: true,
				},
			},
			followers: {
				where: {
					id: session?.user?.id,
				},
			},
			following: true,
		},
	});

	const isProfileOwner = session?.user?.id === user?.id;

	return (
		<div className='overflow-y-auto border-scroll flex flex-col h-full'>
			{/* @ts-ignore */}
			<Profile user={user} isOwner={isProfileOwner} session={session} />
			<div className=''>
				{params.user == "me" && !session ? (
					<>You must be logged in to view your profile</>
				) : (
					children
				)}
			</div>
		</div>
	);
}
