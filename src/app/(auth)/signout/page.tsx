"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Logout() {
	const router = useRouter();

	return (
		<div className='mx-auto mt-8 flex flex-col gap-4 p-8 rounded-lg border-2 border-black text-center md:w-1/3 w-10/12'>
			<h1 className='text-2xl font-black text-left'>TYPER.IO</h1>
			<div className='flex flex-col text-left'>
				<h3 className='font-semibold'>Pera aí...</h3>
				<span className='text-sm opacity-60 font-semibold'>
					Deseja mesmo sair? 😢
				</span>

				<div className='flex justify-between mt-8 text-sm'>
					<button
						onClick={() => router.back()}
						className='font-bold hover:font-normal text-center px-8 py-0.5 hover:text-white hover:bg-black transition-all cursor-pointer w-fit border-2 border-black rounded-md'
					>
						Não
					</button>
					<button
						onClick={() => {
							signOut({
								redirect: true,
								callbackUrl: '/signin'
							});
						}}
						className='font-bold hover:font-normal text-center px-8 py-0.5 hover:text-white hover:bg-black transition-all cursor-pointer w-fit border-2 border-black rounded-md'
					>
						Sair
					</button>
				</div>
			</div>
		</div>
	);
}
