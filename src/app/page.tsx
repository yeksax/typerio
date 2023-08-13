import Link from "next/link";

export const metadata = {
	title: "Typer",
	description: "Compartilhe suas mínimas palavras <3",
};

export default function LandingPage() {
	return (
		<div className='pt-12 md:pt-20 flex flex-col items-center text-center w-full'>
			<h1 className='font-bold text-6xl'>TYPER</h1>
			<h3 className='font-semibold text-lg md:text-4xl w-2/3 mt-6'>
				Plataforminha p brinca para vocês, amigos &lt;3
			</h3>

			<Link
				className='mt-12 px-5 dark:border-zinc-50 py-1 text-sm md:text-2xl font-semibold border-black rounded-lg border-[3px] hover:text-white dark:hover:bg-transparent hover:bg-black transition-colors'
				href='/typer'
			>
				Explorar
			</Link>
		</div>
	);
}
