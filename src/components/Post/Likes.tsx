import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { likePost, unlikePost } from "./actions";
import { useState } from "react";
import { PostButtonProps } from "@/types/interfaces";

interface Props extends PostButtonProps {
	isLiked: boolean
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
		<button
			className={className}
			onClick={async () => {
				if (!user) return;

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
		</button>
	);
}
