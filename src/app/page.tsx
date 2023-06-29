import Sidebar from "@/components/Sidebar/Sidebar";
import Link from "next/link";

export const metadata = {
	title: "Typer.io",
	description:
		"TYPER.IO: Compartilhe suas palavras de forma minimalista e impactante.",
};

export default function LandingPage() {
	return (
		<div className='pt-12 md:pt-20 flex flex-col items-center text-center overflow-scroll w-full'>
			<h1 className='font-bold text-6xl'>TYPER.IO</h1>
			<h3 className='font-semibold text-lg md:text-4xl w-2/3 mt-6'>
				Plataforminha p brinca para vocês, amigos &lt;3
			</h3>

			<Link
				className='mt-12 px-5 py-1 text-sm md:text-2xl font-semibold text-black border-black rounded-lg border-2 hover:text-white hover:bg-black transition-colors'
				href='/typer'
			>
				Explorar
			</Link>
		</div>
	);
}
