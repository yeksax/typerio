import { MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
	anchor: ("right" | "left" | "top" | "bottom")[];
	className?: string;
	children: ReactNode;
	onClick?: (e: MouseEvent) => void;
}

export default function Popover({
	onClick,
	children,
	anchor,
	className,
}: Props) {
	return (
		<motion.div
			initial={{
				opacity: 0,
				scale: 0.7,
			}}
			animate={{
				opacity: 1,
				scale: 1,
			}}
			exit={{
				opacity: 0,
				scale: 0.7,
			}}
			onClick={(e) => {
				if (onClick) onClick(e);
			}}
			className='absolute py-1'
			style={{
				bottom: anchor.includes("top") ? "100%" : undefined,
				top: anchor.includes("bottom") ? "100%" : undefined,
				left: anchor.includes("left") ? "0" : undefined,
				right: anchor.includes("right") ? "0" : undefined,
			}}
		>
			<div className='w-max py-1 px-2 md:px-4 border-2 border-black rounded-md bg-white'>
				{children}
			</div>
		</motion.div>
	);
}
