"use client";

import { ReactNode } from "react";
import ModalContextProvider, { useModal } from "./ModalContext";
import { motion } from "framer-motion";

export default function Backdrop() {
	const ctx = useModal();

	const isVisible = ctx.backdropVisible && !ctx.temporarilyHidden;

	return (
		<>
			<motion.div
				className='fixed top-0 left-0 z-30 w-full h-full bg-black/50'
				onClick={(e) => {
					ctx.hide();
				}}
				initial={{
					pointerEvents: "none",
					opacity: 0,
				}}
				animate={{
					pointerEvents: isVisible ? "all" : "none",
					opacity: isVisible ? 1 : 0,
				}}
			>
				{/* {children} */}
			</motion.div>
			<motion.div
				className='bg-white px-4 py-0.5 border-2 text-sm cursor-pointer border-black rounded-md z-30 fixed left-1/2 -translate-x-1/2 bottom-4'
				initial={{
					transform: "translateY(-8px) translateX(-50%)",
					pointerEvents: "none",
					opacity: 0,
				}}
				animate={{
					transform: ctx.temporarilyHidden
						? "translateY(-8px) translateX(-50%)"
						: "translateY(0) translateX(-50%)",
					opacity: ctx.temporarilyHidden ? 1 : 0,
					pointerEvents: ctx.temporarilyHidden ? "all" : "none",
				}}
				onClick={() => {
					ctx.show();
				}}
			>
				Voltar a editar
			</motion.div>
		</>
	);
}
