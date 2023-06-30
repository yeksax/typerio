import { PostButtonProps } from "@/types/interfaces";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { useState } from "react";
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
	const [isLiked, setIsLiked] = useState(_isLiked);
	const [likeCount, setLikeCount] = useState(value);

	return (
		<motion.button
			whileHover={{ scale: 1.1 }}
			className={className}
			onClick={async () => {
				if (!user) return;
				if (user == 'loading') return;

				if (isLiked) {
					setLikeCount(likeCount - 1);
					setIsLiked(false);
					await unlikePost(id, user);
				} else {
					setLikeCount(likeCount + 1);
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
