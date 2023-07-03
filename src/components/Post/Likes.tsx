import { PostButtonProps } from "@/types/interfaces";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { likePost, unlikePost } from "./actions";
import { useAtom } from "jotai";
import { likedPostsAtom, unlikedPostsAtom } from "@/atoms/appState";

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
				<FontAwesomeIcon icon={faHeartSolid} className={iconClass} />
			)}
			{!isLiked && (
				<FontAwesomeIcon icon={faHeart} className={iconClass} />
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
