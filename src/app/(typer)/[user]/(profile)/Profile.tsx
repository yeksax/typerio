"use client";

import { _User } from "@/types/interfaces";
import { getRandomEmoji } from "@/utils/general/emoji";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { FiLink, FiMail, FiUserMinus, FiUserPlus } from "react-icons/fi";
import { followUser, unfollowUser } from "./actions";
import { Session } from "next-auth";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface Props {
	user: _User | null;
	isOwner: boolean;
	session: Session | null;
}

const months = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

export default function Profile({ user, isOwner, session }: Props) {
	function getJoinDate(date: Date) {
		let str = "Entrou em ";
		str += months[date.getMonth()].toLowerCase();
		str += ` de ${date.getFullYear()}`;

		return str;
	}

	const [followCount, setFollowCount] = useState(user?._count.followers);
	const [isFollowing, setFollowing] = useState(user?.followers.length! > 0);
	const [followState, setFollowState] = useState(<>Seguindo</>);
	const [randomEmoji, setRandomEmoji] = useState("🤫");

	useEffect(()=>{
		setRandomEmoji(getRandomEmoji('Smileys & Emotion'))
	}, [])

	if (!user) return <>:p</>;

	let profileUrls: string[] = [];

	if (
		user?.links &&
		typeof user?.links === "object" &&
		Array.isArray(user?.links)
	) {
		profileUrls = user?.links as string[];
	}

	return (
		<>
			<div className='relative pb-4'>
				<Image
					src={user?.banner}
					width={600}
					height={200}
					alt={`banner de ${user.name}`}
					className='border-b-2 border-black w-full h-32 md:h-40'
				/>
				<div className='absolute px-6 md:px-12 -translate-y-2/3 flex gap-4 items-end'>
					<Image
						src={user?.avatar}
						width={72}
						height={72}
						alt={`avatar de ${user.name}`}
						className='w-16 h-16 md:w-20 md:h-20 border-2 border-black rounded-md bg-white'
					/>
					<div className='flex w-full mb-0.5 md:mb-1 items-center'>
						<span className='text-xs'>
							{getJoinDate(user.createdAt)}
						</span>
					</div>
				</div>
			</div>
			<div className='mt-4 md:mt-6 px-6 md:px-12 flex flex-col'>
				<div className='flex justify-between items-start'>
					<h3 className='font-semibold text-base'>
						{user.name}
						<span className='font-regular opacity-70 text-sm'>
							#{user.tag}
						</span>
					</h3>

					{isOwner ? (
						<Link
							href={"/preferences/profile"}
							className='px-3 bg-white grid place-items-center py-0.5 text-black rounded-md border-black border-2'
						>
							<span className='text-xs'>Editar Perfil</span>
						</Link>
					) : (
						<div className='flex gap-4 align-center'>
							<Link
								href={`/typos/${user.username}`}
								className='grid place-items-center hover:text-white text-black bg-white transition-all hover:bg-black rounded-full w-6 h-6'
							>
								<FiMail size={16} className='' />
							</Link>
							<button
								onMouseEnter={() =>
									setFollowState(
										<>
											<FiUserMinus size={16} /> Deixar de
											seguir
										</>
									)
								}
								onMouseLeave={() =>
									setFollowState(<>Seguindo</>)
								}
								onClick={async () => {
									if (!session) return;

									if (isFollowing) {
										setFollowCount(followCount! - 1);
										setFollowing(false);
										await unfollowUser(
											user.id,
											session.user!.id
										);
									} else {
										setFollowCount(followCount! + 1);
										setFollowing(true);
										await followUser(
											user.id,
											session.user!.id
										);
									}
								}}
								className={`px-3 text-xs ${
									isFollowing
										? "bg-black text-white hover:bg-red-500"
										: "bg-white text-black font-semibold hover:bg-black hover:text-white hover:font-normal"
								} transition-all grid place-items-center py-0.5 rounded-md border-black border-2`}
							>
								{isFollowing ? (
									<span className='flex gap-2 items-center'>
										{followState}
									</span>
								) : (
									<span className='flex gap-2 items-center'>
										<FiUserPlus size={16} /> Seguir
									</span>
								)}
							</button>
						</div>
					)}
				</div>

				<div className='mt-2'>
					<pre className={`break-words text-xs whitespace-pre-wrap`}>
						{user.biography.length > 0 ? (
							user.biography
						) : (
							<span className='text-gray-700'>
								Sem biografia...{" "}
								{randomEmoji}
							</span>
						)}
					</pre>
				</div>

				{profileUrls && (
					<div className='flex gap-x-4 gap-y-1 mt-2 flex-wrap justify-between w-full'>
						{profileUrls.map((url, i) => (
							<Link
								key={i}
								href={url}
								target='_blank'
								rel='noreferrer'
								className='text-xs flex gap-2 items-center'
							>
								<FiLink size={12} />
								<span className='text-blue-600'>
									{url
										.replaceAll("https://", "")
										.replaceAll("www.", "")
										.replaceAll("http://", "")}
								</span>
							</Link>
						))}
					</div>
				)}

				<div className='mt-4 text-sm flex justify-between items-center'>
					<Link href={`/${user.username}/followers`}>
						{followCount} seguidores
					</Link>
					<Link href={`/${user.username}/following`}>
						{user._count.following} seguindo
					</Link>
				</div>
			</div>
			<div className='border-b-2 mt-4 border-black flex justify-between'>
				<PageSwitcher href={`/${user.username}`}>Posts</PageSwitcher>
				<PageSwitcher href={`/${user.username}/replies`}>
					Respostas
				</PageSwitcher>
				<PageSwitcher href={`/${user.username}/likes`}>
					Curtidas
				</PageSwitcher>
			</div>
		</>
	);
}

interface LinkProps {
	href: string;
	children?: ReactNode;
}

function PageSwitcher({ href, children }: LinkProps) {
	const path = usePathname().split("/");
	const [hovering, setHovering] = useState(false);

	const isCurrentPage =
		path[path.length - 1] === href.split("/")[href.split("/").length - 1];

	return (
		<Link
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			className={`px-6 md:px-12 text-sm py-4 hover:font-semibold ${
				isCurrentPage
					? "switcher-current-page font-semibold"
					: "switcher-page"
			} transition-all`}
			href={href}
		>
			{children}
		</Link>
	);
}
