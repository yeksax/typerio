import PageTitle from "@/components/PageTitle";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ReactNode } from "react";
import { isMobile } from "react-device-detect";
import { FiBell, FiChevronRight, FiUser } from "react-icons/fi";
import { TbBrush } from "react-icons/tb";
import SettingsSignOut from "./signOut";

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
			<PageTitle title='Configurações' />

			<div className='flex flex-col'>
				<SettingPageRedirect
					href='/settings/profile'
					icon={<FiUser size={20} />}
					title='Perfil'
					description={`Edite seu perfil :)`}
				/>
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
				<SettingsSignOut />
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
			className='group flex gap-4 md:gap-8 items-center px-4 md:px-8 py-3 md:py-4'
		>
			{icon}
			<div className='flex flex-col gap-0.5 flex-1'>
				<h3 className='font-medium text-sm'>{title}</h3>
				<span className='text-xs opacity-80 break-all line-clamp-1'>
					{description}
				</span>
			</div>
			<FiChevronRight />
		</Link>
	);
}
