"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { FiMinus, FiX } from "react-icons/fi";
import { useModal } from "./ModalContext";

interface Props {
	children: ReactNode;
	title?: string;
}

export default function Modal({ children, title }: Props) {
	const ctx = useModal();
	const isVisible = ctx.backdropVisible && !ctx.temporarilyHidden;

	return (
		<motion.div
			initial={{
				pointerEvents: "none",
				opacity: 0,
				x: "-50%",
				scale: 0.9,
			}}
			animate={{
				pointerEvents: isVisible ? "all" : "none",
				opacity: isVisible ? 1 : 0,
				y: isVisible ? -208 : -200,
				x: "-50%",
				scale: isVisible ? 1 : 0.9,
			}}
			className='px-6 py-2 w-10/12 sm:w-6/12 md:w-4/12 pointer-events-auto min-w-max z-40 border-2 border-black rounded-md bg-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
		>
			<div className='flex align-center gap-8 justify-between'>
				<h3 className='text-sm font-semibold'>{title}</h3>
				<div className='flex gap-2'>
					<FiMinus
						className='cursor-pointer'
						onClick={() => ctx.hide()}
					/>
					<FiX
						className='cursor-pointer'
						onClick={() => {
							ctx.close();
						}}
					/>
				</div>
			</div>

			<div className='mt-4'>{children}</div>
		</motion.div>
	);
}
