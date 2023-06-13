import { _Post } from "@/types/interfaces";
import {
	faDeleteLeft,
	faEllipsisV,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { MouseEvent, useEffect, useState, useTransition } from "react";
import { deletePost } from "./actions";
import { FiUserMinus, FiUserPlus } from "react-icons/fi";
import {
	followUser,
	unfollowUser,
} from "@/app/(typer)/[user]/(profile)/actions";

interface Props {
	post: _Post;
}

export default function PostActions({ post }: Props) {
	const [showActions, setShowActions] = useState(false);
	const [isFollowing, setFollowingState] = useState(false);
	const [isAuthor, setAuthor] = useState(false);
	const [isPeding, startTransition] = useTransition();
	const { data: session } = useSession();

	const [isDeleting, setDeleting] = useState(false);

	useEffect(() => {
		if (session?.user?.id === post.author.id) {
			setAuthor(true);
		}

		if (post.author.followers) {
			if (
				post.author.followers.find((f) => f.id === session?.user?.id) !=
				undefined
			)
				setFollowingState(true);
		}
	}, [post.author.id, session]);

	return (
		<div className='relative'>
			<div
				className='h-4 w-4 cursor-pointer flex justify-end items-center'
				onClick={() => setShowActions(!showActions)}
			>
				<FontAwesomeIcon size='lg' className='h-3' icon={faEllipsisV} />
			</div>
			<motion.div
				className='flex flex-col rounded-md w-max z-50 gap-4 absolute bg-white px-2 md:px-4 py-1 md:py-2 border-2 border-black'
				onMouseLeave={() => setShowActions(false)}
				initial={{ opacity: 0, y: -10, top: "150%", right: 0 }}
				animate={{
					opacity: showActions ? 1 : 0,
					y: showActions ? 0 : 10,
				}}
			>
				{session && (
					<>
						<div
							className='flex items-center gap-4 cursor-pointer'
							onClick={async () => {
								if (isFollowing) {
									setFollowingState(false);
									await unfollowUser(
										post.author.id,
										session.user!.id
									);
								} else {
									setFollowingState(true);
									await followUser(
										post.author.id,
										session.user!.id
									);
								}
							}}
						>
							{isFollowing ? (
								<span className='text-red-500 items-center flex gap-2'>
									<FiUserMinus />
									Unfollow
								</span>
							) : (
								<span className='flex items-center gap-2'>
									<FiUserPlus />{" "}
									<span className='font-semibold'>
										Seguir
									</span>{" "}
									{post.author.name}
								</span>
							)}
						</div>
					</>
				)}
				{isAuthor && (
					<>
						<div
							className='flex items-center gap-4'
							onClick={() => {
								if (!isDeleting) setDeleting(true);
							}}
						>
							<FontAwesomeIcon
								icon={faTrash}
								size='lg'
								className='w-4 h-4 text-red-500'
							/>
							<span className='flex flex-col gap-2 pointer-cursor'>
								{isDeleting ? (
									"Deseja mesmo excluir esse post?"
								) : (
									<span className='text-red-500 cursor-pointer'>
										Excluir
									</span>
								)}
								{isDeleting && (
									<div className='flex justify-between w-full'>
										<button
											onClick={() => setDeleting(false)}
										>
											Não
										</button>
										<button
											className='text-red-500'
											onClick={() =>
												startTransition(() =>
													deletePost(
														post.id,
														post.author.username
													)
												)
											}
										>
											Sim, deletar
										</button>
									</div>
								)}
							</span>
						</div>
					</>
				)}
			</motion.div>
		</div>
	);
}
