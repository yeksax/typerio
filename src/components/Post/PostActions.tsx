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

interface Props {
	post: _Post;
}

export default function PostActions({ post }: Props) {
	const [showActions, setShowActions] = useState(false);
	const [isAuthor, setAuthor] = useState(false);
	const [isPeding, startTransition] = useTransition();
	const { data: session } = useSession();

	const [isDeleting, setDeleting] = useState(false);

	useEffect(() => {
		if (session?.user?.id === post.author.id) {
			setAuthor(true);
		}
	}, [post.author.id, session]);

	return (
		<div className='relative'>
			<div
				className='h-4 w-4 cursor-pointer flex justify-end items-center'
				onClick={() => setShowActions(!showActions)}
			>
				<FontAwesomeIcon color='rgba(0,0,0,75)' icon={faEllipsisV} />
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
				{isAuthor && (
					<>
						<div
							className='text-red-500 flex items-center gap-4'
							onClick={() => {
								if (!isDeleting) setDeleting(true);
							}}
						>
							<FontAwesomeIcon icon={faTrash} />
							<span className='flex flex-col gap-2 pointer-cursor'>
								{isDeleting
									? "Deseja mesmo excluir esse post?"
									: "Excluir"}
								{isDeleting && (
									<div className='flex justify-between w-full'>
										<button
											className='text-black'
											onClick={() => setDeleting(false)}
										>
											Não
										</button>
										<button
											onClick={() =>
												startTransition(() => deletePost(post.id))
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
