import Link from "next/link";

export const metadata = {
	title: "Typer.io",
	description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
};

export default function LandingPage() {
	"use client";
	
	return (
		<div className='mt-20 flex flex-col items-center text-center'>
			<h1 className='font-bold text-6xl'>Typer.io</h1>
			<h3 className='font-bold text-4xl w-1/2 mt-6'>
				Lorem ipsum dolor sit amet consectetur adipisicing elit.
			</h3>

			<Link
				className='mt-12 px-5 py-1.5 text-xl font-semibold text-black border-black rounded-lg border-2 hover:text-white hover:bg-black transition-colors'
				href='/explore'
			>
				Explorar
			</Link>
		</div>
	);
}
