"use server";

import Sidebar from "@/components/Sidebar/Sidebar";
import { prisma } from "@/services/prisma";
import Image from "next/image";
import Link from "next/link";
import { joinGroup } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
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
			{/* @ts-ignore */}
			<Sidebar forceCollapse />
			{invite && session && (
				<main className='grid place-items-center flex-1'>
					<JoinForm invite={invite} session={session}/>
				</main>
			)}
		</div>
	);
}
