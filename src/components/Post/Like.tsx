import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { likePost, unlikePost } from "./actions";
import { useState } from "react";

interface Props {
	id: string;
	user: string;
	isLiked: boolean;
	likeCount: number;
}

export default function Like({
	id,
	user,
	likeCount: _likeCount,
	isLiked: _isLiked,
}: Props) {
	const [isLiked, setIsLiked] = useState(_isLiked);
	const [likeCount, setLikeCount] = useState(_likeCount);

	const iconClass = "w-4 aspect-square";

	return (
		<button
			className='flex gap-1.5 items-center w-12'
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
			{likeCount > 0 && <span>{likeCount}</span>}
		</button>
	);
}
