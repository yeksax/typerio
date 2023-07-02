import ModalContextProvider from "@/components/Modal/ModalContext";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import Profile from "./Profile";

interface Props {
	children: ReactNode;
	params: {
		user: string;
	};
}

export async function generateMetadata({
	params,
}: {
	params: Props["params"];
}) {
	const user = await prisma.user.findUnique({
		where: { username: params.user },
	});

	return {
		title:
			params.user == "me"
				? "Meu Perfil"
				: !user
				? "Usuário não encontrado"
				: `${user?.name}'s Profile`,
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
		<>
			<ModalContextProvider>
				<div className='flex flex-col h-full'>
					{/* @ts-ignore */}
					<Profile
						user={user}
						isOwner={isProfileOwner}
						session={session}
					/>
					<div className='flex flex-col'>
						{params.user == "me" && !session ? (
							<>You must be logged in to view your profile</>
						) : (
							children
						)}
					</div>
				</div>
			</ModalContextProvider>
		</>
	);
}
