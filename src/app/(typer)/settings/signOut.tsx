"use client";

import { signOut } from "next-auth/react";
import { FiChevronRight, FiLogOut } from "react-icons/fi";

interface Props {}

export default function SettingsSignOut({}: Props) {
	return (
		<button
			onClick={() =>
				signOut({
					callbackUrl: "/signin",
				})
			}
			className='group text-red-500 text-left flex gap-4 md:gap-8 items-center px-4 md:px-8 py-3 md:py-4'
		>
			<FiLogOut size={20} />
			<div className='flex flex-col gap-0.5 flex-1'>
				<h3 className='font-medium text-sm'>Desconectar</h3>
				<span className='text-xs opacity-80 break-all line-clamp-1'>
					Toque aqui para encerrar sua sessão &lt;/3
				</span>
			</div>
			<FiChevronRight />
		</button>
	);
}
