"use server";

import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import JoinForm from "./joinForm";

interface Props {
	params: {
		id: string;
	};
}
export default async function InvitePage({ params }: Props) {
	const session = await getServerSession(authOptions);

	const invite = await prisma.chatInvite.findFirst({
		where: {
			code: params.id,
		},
		include: {
			owner: true,
			chat: {
				include: {
					_count: {
						select: {
							members: true,
						},
					},
				},
			},
		},
	});

	return (
		<div className='flex h-full w-full'>
			{invite && session && (
				<div className='grid place-items-center flex-1'>
					<JoinForm invite={invite} session={session}/>
				</div>
			)}
		</div>
	);
}
