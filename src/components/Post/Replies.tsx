import { PostButtonProps } from "@/types/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { faComment as faCommentSolid, faReply } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";

interface Props extends PostButtonProps {
	setReplyOpen?: any;
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
		<motion.button
			whileHover={{ scale: 1.1 }}
			className={className}
			onClick={async () => {
				if (setReplyOpen && user != undefined) setReplyOpen((prev: boolean) => !prev);
			}}
		>
			{isReplying ? (
				<FiMessageSquare size={16} fill="black"/>
				) : (
				<FiMessageSquare size={16}/>
			)}

			<span className={value ? "" : "invisible"}>{value}</span>
		</motion.button>
	);
}
