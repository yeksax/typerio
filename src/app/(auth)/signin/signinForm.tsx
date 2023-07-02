"use client";

import { getRandomEmoji } from "@/utils/general/emoji";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiGithub } from "react-icons/fi";

export default function SignInForm() {
	const [error, setError] = useState<string | null>(null);
	const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl")

	function githubLogin() {
		signIn("github", {callbackUrl: callbackUrl || window.location.origin});
	}

	function googleLogin() {
		signIn("google", {callbackUrl: callbackUrl || window.location.origin});
	}

	useEffect(() => {
		setError(new URLSearchParams(window.location.search).get("error"));
	}, []);

	return (
		<div className='mx-auto mt-8 flex flex-col gap-4 px-6 py-4 rounded-lg border-2 border-black text-center md:w-1/3 w-10/12'>
			<h1 className='text-2xl font-black text-left'>TYPER.IO</h1>
			<SessionError error={error} />
			<div className='flex flex-col text-left'>
				<h3 className='font-semibold'>Se conecte</h3>
				<span className='text-sm opacity-60 font-semibold'>
					para continuar em{" "}
					<span className='font-bold'>TYPER.IO</span>
				</span>
			</div>
			<div className='flex flex-col gap-3 mt-2'>
				<div
					className='px-6 py-2 hover:text-white hover:bg-black transition-all button flex items-center gap-4 cursor-pointer w-full border-2 border-black rounded-md'
					onClick={githubLogin}
				>
					<FiGithub size={24} />
					<span className='font-semibold'>Continuar com Github</span>
				</div>
				<div
					className='px-6 py-2 hover:text-white hover:bg-black transition-all button flex items-center gap-4 cursor-pointer w-full border-2 border-black rounded-md'
					onClick={googleLogin}
				>
					<FaGoogle size={24} />
					<span className='font-semibold'>Continuar com Google</span>
				</div>
			</div>
		</div>
	);
}

export function SessionError({ error }: { error: string | null }) {
	if (!error) return <></>;

	const errors: {
		[key: string]: {
			title: string;
			text: string;
		};
	} = {
		newStructure: {
			title: "Tem algo de errado com sua sessão...",
			text: "Para resolver, basta fazer login novamente 😁",
		},
		protectedRoute: {
			title: "Opa, que tal fazer login...",
			text: `A página que você está tentando acessar é exclusiva para usuários ${getRandomEmoji(
				"Smileys & Emotion",
				"face-hand"
			)}`,
		},
	};

	let errorData = errors[error];
	if (!errorData) {
		errorData = {
			title: "Tem algo de errado com seu login...",
			text: "Causa desconhecida 🫢😨😱",
		};
	}

	return (
		<div className='flex mb-4 text-center flex-col items-center gap-2 px-4 py-2 bg-red-100 border-2 border-black rounded-md'>
			<h2 className='font-bold'>{errorData.title}</h2>
			<p className='text-xs'>{errorData.text}</p>
		</div>
	);
}
