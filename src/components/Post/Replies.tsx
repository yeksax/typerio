import { PostButtonProps } from "@/types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faComment as faCommentSolid } from "@fortawesome/free-solid-svg-icons";

interface Props extends PostButtonProps {
	setReplyOpen: any;
	isReplying: boolean;
}

export default function Replies({
	id,
	user,
	value,
	className,
	iconClass,
	setReplyOpen,
	isReplying,
}: Props) {
	return (
		<button
			className={className}
			onClick={async () => {
				setReplyOpen((prev: boolean) => !prev);
			}}
		>
			{isReplying ? (
				<FontAwesomeIcon icon={faCommentSolid} className={iconClass} />
				) : (
				<FontAwesomeIcon icon={faComment} className={iconClass} />
			)}

			<span className={value ? "" : "invisible"}>{value}</span>
		</button>
	);
}
