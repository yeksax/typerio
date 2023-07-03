import { PostButtonProps } from "@/types/interfaces";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useState } from "react";
import { likePost, unlikePost } from "./actions";
import { useAtom } from "jotai";
import { likedPostsAtom } from "@/atoms/appState";

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
	const [isLiked, setIsLiked] = useState(_isLiked);
	const [likeCount, setLikeCount] = useState(
		isLiked && value === 0 ? 1 : value
	);
	const [likedPosts, setLikedPosts] = useAtom(likedPostsAtom);

	return (
		<motion.button
			whileHover={{ scale: 1.1 }}
			className={className}
			onClick={async () => {
				if (!user) return;
				if (user == "loading") return;

				if (isLiked) {
					setLikeCount(likeCount - 1);
					setLikedPosts((prev) => prev.filter((post) => post != id));
					setIsLiked(false);
					await unlikePost(id, user);
				} else {
					setLikeCount(likeCount + 1);
					setLikedPosts((prev) => [...prev, id]);
					setIsLiked(true);
					await likePost(id, user);
				}
			}}
		>
			{isLiked && (
				<FontAwesomeIcon icon={faHeartSolid} className={iconClass} />
			)}
			{!isLiked && (
				<FontAwesomeIcon icon={faHeart} className={iconClass} />
			)}
			<span className={likeCount ? "" : "invisible"}>{likeCount}</span>
		</motion.button>
	);
}
