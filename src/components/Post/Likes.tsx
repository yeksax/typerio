import { likedPostsAtom, unlikedPostsAtom } from "@/atoms/appState";
import { PostButtonProps } from "@/types/interfaces";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { likePost, unlikePost } from "./actions";

interface Props extends PostButtonProps {
	isLiked: boolean;
}

export default function Likes({
	id,
	user,
	value,
	isLiked: _isLiked,
	className,
	iconClass,
}: Props) {
	const [likedPosts, setLikedPosts] = useAtom(likedPostsAtom);
	const [unlikedPosts, setUnlikedPosts] = useAtom(unlikedPostsAtom);
	const [isLiked, setIsLiked] = useState(
		_isLiked || (likedPosts.includes(id) && !unlikedPosts.includes(id))
	);

	return (
		<motion.button
			whileHover={{ scale: 1.1 }}
			className={className}
			onClick={async () => {
				if (!user) return;
				if (user == "loading") return;

				if (isLiked) {
					setLikedPosts((prev) => prev.filter((post) => post != id));
					setUnlikedPosts((prev) => [...prev, id]);
					setIsLiked(false);
					unlikePost(id, user);
				} else {
					setUnlikedPosts((prev) =>
						prev.filter((post) => post != id)
					);
					setLikedPosts((prev) => [...prev, id]);
					setIsLiked(true);
					likePost(id, user);
				}
			}}
		>
			{isLiked && (
				<FiHeart fill="#000000" className={iconClass} />
			)}
			{!isLiked && (
				<FiHeart fill="none" stroke="#000000" className={iconClass} />
			)}
			<span
				className={
					value +
					(likedPosts.includes(id) && !_isLiked
						? 1
						: unlikedPosts.includes(id) && _isLiked
						? -1
						: 0)
						? ""
						: "invisible"
				}
			>
				{value +
					(likedPosts.includes(id) && !_isLiked
						? 1
						: unlikedPosts.includes(id) && _isLiked
						? -1
						: 0)}
			</span>
		</motion.button>
	);
}
