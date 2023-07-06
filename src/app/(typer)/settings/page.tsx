import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ReactNode } from "react";
import { FiBell, FiChevronRight } from "react-icons/fi";
import { SectionTitle } from "./pageTitle";
import { isMobile } from "react-device-detect";
import { FaPaintBrush } from "react-icons/fa";
import { TbBrush } from "react-icons/tb";

export default async function PreferencesPage() {
	const session = await getServerSession(authOptions);

	let user = await prisma.user.findUnique({
		where: {
			id: session!.user!.id,
		},
		include: {
			preferences: true,
		},
	});

	if (!user?.preferences) {
		user = await prisma.user.update({
			where: {
				id: session!.user!.id,
			},
			data: {
				preferences: {
					create: {},
				},
			},
			include: {
				preferences: true,
			},
		});
	}

	return (
		<>
			<SectionTitle>Configurações</SectionTitle>
			<div className='flex flex-col'>
				<SettingPageRedirect
					href='/settings/notifications'
					icon={
						<FiBell
							size={20}
							className='group-hover:animate-ring'
						/>
					}
					title='Notificações'
					description={`Gerencie as notificações no seu ${
						isMobile ? "celular" : "computador"
					}`}
				/>
				<SettingPageRedirect
					href='/settings/appearance'
					icon={<TbBrush size={20} />}
					title='Aparência'
					description={`Como você prefere ver as coisas ${
						isMobile ? "celular" : "computador"
					}?`}
				/>
			</div>
		</>
	);
}

function SettingPageRedirect({
	href,
	icon,
	title,
	description,
}: {
	href: string;
	title: string;
	description: string;
	icon: ReactNode;
}) {
	return (
		<Link
			href={href}
			className='group flex gap-2 md:gap-4 items-center px-4 md:px-8 py-3 md:py-4'
		>
			{icon}
			<div className='flex flex-col gap-0.5 flex-1'>
				<h3 className='font-semibold text-sm'>{title}</h3>
				<span className='text-xs text-gray-600 dark:text-zinc-400 break-all line-clamp-1'>
					{description}
				</span>
			</div>
			<FiChevronRight />
		</Link>
	);
}
