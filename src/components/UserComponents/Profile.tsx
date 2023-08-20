"use client";

import {
	followedUsersAtom,
	unfollowedUsersAtom,
	userAtom,
} from "@/atoms/appState";
import { useModal } from "@/components/Modal/ModalContext";
import { FollowButton } from "@/components/UserComponents/FollowButton";
import { _User } from "@/types/interfaces";
import { getJoinDate } from "@/utils/client/readableTime";
import { getRandomEmoji } from "@/utils/general/emoji";
import { useAtom } from "jotai";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FiCheck, FiLink, FiMail } from "react-icons/fi";

interface Props {
	user: _User | null;
	isOwner: boolean;
	session: Session | null;
	onBannerClick?: (src: string) => void;
	onAvatarClick?: (src: string) => void;
}

export default function Profile({
	user,
	isOwner,
	session,
	onAvatarClick,
	onBannerClick,
}: Props) {
	const page = usePathname().split("/")[1];
	const modalCtx = useModal();

	const descriptionRef = useRef<HTMLTextAreaElement>(null);
	const [url, setURL] = useState("")
	const validLinkRef = useRef(false);

	const [myUser, setUser] = useAtom(userAtom);
	const [followedUsers, setFollowedUsers] = useAtom(followedUsersAtom);
	const [unfollowedUsers, setUnfollowedUsers] = useAtom(unfollowedUsersAtom);
	const [followCount, setFollowCount] = useState(user?._count.followers || 0);
	const [isFollowing, setFollowing] = useState(
		user?.followers?.length! > 0 && !!session
	);
	const [randomEmoji, setRandomEmoji] = useState("🤫");

	const [editState, setEditState] = useState<{
		state: "saving" | "loading" | "done" | "idle" | "file_done";
		message?: string;
		children?: ReactNode;
	}>({
		state: "idle",
		message: "Salvar",
	});
	const [tagCompletion, setTagCompletion] = useState("");

	useEffect(() => {
		setRandomEmoji(getRandomEmoji("Smileys & Emotion"));
		if (descriptionRef.current) resize(descriptionRef.current);
		if (user?.link) {
			try {
				new URL(user?.link)
				setURL(user.link);
				validLinkRef.current = true
			} catch (e) { }
		}
	}, []);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (editState.state === "file_done") {
			timeout = setTimeout(() => {
				setEditState({
					state: "done",
					children: (
						<>
							<FiCheck size={14} />
							<span>Tudo pronto!</span>
						</>
					),
				});
			}, 2500);
		} else if (editState.state === "done") {
			timeout = setTimeout(() => {
				setEditState({
					state: "idle",
					children: <span>Salvar</span>,
				});
				modalCtx.close();
			}, 1500);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [editState.state]);

	function resize(e: HTMLElement) {
		e.style.height = "1lh";
		e.style.height = e.scrollHeight + "px";
	}

	if (isOwner && myUser) user = myUser;

	if (!user) return <>:p</>;

	return (
		<>
			<div className='relative pb-4'>
				<Image
					src={user.banner}
					onClick={() => {
						if (onBannerClick) onBannerClick(user!.banner);
					}}
					width={1200}
					quality={100}
					height={400}
					alt={`banner de ${user.displayName}`}
					className='border-b-2 object-cover border-black dark:border-zinc-950 w-full h-32 md:h-40'
				/>
				<div className='absolute px-6 md:px-12 -translate-y-2/3 flex gap-4 items-end'>
					<Image
						src={user?.avatar}
						onClick={() => {
							if (onAvatarClick) onAvatarClick(user!.banner);
						}}
						width={156}
						height={156}
						alt={`avatar de ${user.displayName}`}
						className='w-16 h-16 aspect-square object-cover md:w-20 md:h-20 border-2 border-black dark:border-zinc-950 rounded-md bg-white'
					/>
					<div className='flex w-full mb-0.5 md:mb-1 items-center'>
						<span className='text-xs opacity-80'>
							{getJoinDate(user.createdAt)}
						</span>
					</div>
				</div>
			</div>
			<div className='mt-6 md:mt-8 px-6 md:px-12 flex flex-col'>
				<div className='flex justify-between items-start gap-4'>
					<div className='flex flex-col'>
						<h3 className='truncate break-all font-semibold'>
							{user.displayName || user.name}
						</h3>
						<div className='text-sm -mt-1 opacity-80 w-full h-6 flex items-end min-w-0'>
							<h3 className='truncate break-all'>{user.name}</h3>
							<span className='font-regular opacity-70'>
								#{user.tag + tagCompletion}
							</span>
						</div>
					</div>

					{isOwner ? (
						<Link
							href='/settings/profile'
							className='cursor-pointer px-3 bg-white dark:bg-zinc-800 grid place-items-center py-0.5 text-black dark:text-zinc-50 rounded-md hover:text-white hover:bg-black transition-all border-black dark:hover:bg-zinc-950 dark:border-zinc-950 border-2'
						>
							<span className='w-max text-xs'>Editar Perfil</span>
						</Link>
					) : (
						session && (
							<div className='flex gap-2 items-center'>
								{!isOwner && (
									<Link
										href={`/typos/${page}`}
										className='w-7 h-6 text-xs cursor-pointer bg-white dark:bg-zinc-800 grid place-items-center py-0.5 text-black dark:text-zinc-50 rounded-md hover:text-white hover:bg-black transition-all border-black dark:hover:bg-zinc-950 dark:border-zinc-950 border-2'
									>
										<FiMail
											size={16}
											className='box-content'
										/>
									</Link>
								)}
								<FollowButton
									isFollowing={isFollowing}
									target={user.id}
									user={session.user.id}
								/>
							</div>
						)
					)}
				</div>

				<pre className={`mt-4 break-words text-xs whitespace-pre-wrap`}>
					{user.biography.length > 0 ? (
						user.biography
					) : (
						<span className='text-gray-700 dark:text-zinc-400'>
							Sem biografia... {randomEmoji}
						</span>
					)}
				</pre>

				{validLinkRef.current &&
					<Link
						href={url}
						target='_blank'
						rel='noreferrer'
						prefetch={false}
						className='flex items-center gap-2 text-blue-600 dark:text-blue-400 mt-4'
					>
						<FiLink size={12} className='min-w-0' />
						<pre className='break-all text-sm truncate flex-1'>
							{new URL(url).hostname}
							{new URL(url).pathname}
						</pre>
					</Link>
				}

				<div className='mt-4 text-sm flex justify-between items-center'>
					<Link href={`/${page}/followers`}>
						{followCount
							? followCount +
							(followedUsers.includes(user.id) && !isFollowing
								? 1
								: unfollowedUsers.includes(user.id) &&
									isFollowing
									? -1
									: 0)
							: 0}{" "}
						seguidores
					</Link>
					<Link href={`/${page}/following`}>
						{user._count.following} seguindo
					</Link>
				</div>
			</div>
			<div className='border-b-2 px-6 md:px-12 mt-4 border-black flex justify-between'>
				<PageSwitcher href={`/${page}`}>Posts</PageSwitcher>
				<PageSwitcher href={`/${page}/replies`}>Respostas</PageSwitcher>
				<PageSwitcher href={`/${page}/likes`}>Curtidas</PageSwitcher>
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
		path[path.length - 1] == href.split("/")[href.split("/").length - 1];

	return (
		<Link
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			className={`text-sm w-full last-of-type:text-right first-of-type:text-left text-center py-4 hover:font-semibold ${isCurrentPage
				? "switcher-current-page font-semibold"
				: "switcher-page"
				} transition-all`}
			href={href}
		>
			{children}
		</Link>
	);
}
