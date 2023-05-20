import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
	const { data: session } = useSession();

	const linkCss = "hover:font-semibold transition-all";

	return (
		<header
			className={`px-6 md:px-12 h-20 flex justify-between items-center border-b-2 border-b-black fixed top-0 left-0 w-full glass`}
		>
			<Link href='/' className='text-2xl upercase font-extrabold'>
				TYPER
			</Link>
			<nav className='flex gap-12'>
				<Link className={linkCss} href='/explore'>
					Explorar
				</Link>
				{session && (
					<>
						<Link className={linkCss} href='/user/groups'>
							Comunidades
						</Link>
						{/* <Link className={linkCss} href="/friends">Amigos</Link> */}
					</>
				)}
			</nav>
			<nav>
				{session ? (
					// <Link className={linkCss} href={`/user/me`}>
					// 	Meu Perfil
					// </Link>
					<button className={linkCss} onClick={() => signOut()}>
						Meu Perfil
					</button>
				) : (
					<Link className={linkCss} href='/signin'>
						Login
					</Link>
				)}
			</nav>
		</header>
	);
}
