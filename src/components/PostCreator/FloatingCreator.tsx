"use client";

import {
  creatorFloat, creatorIntersection
} from "@/atoms/creatorAtom";
import { User } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import PostCreator from "./PostCreator";

interface Props {
  user: User
}

export default function FloatingCreator({user}: Props) {
	const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
	const [isFloating, setFloating] = useAtom(creatorFloat);
	const [isIntersecting, setIsIntersecting] = useAtom(creatorIntersection);

	const shortcutHandler = (e: KeyboardEvent) => {
		const { key, ctrlKey, shiftKey, altKey } = e;

		if ((e.target as HTMLElement).tagName === "BODY") {
			if (key === "n") {
				setFloating((prev) => !prev);
			}
		}
	};

  useEffect(() => {
		let options = {
			root: document.querySelector("#main-scroll"),
			rootMargin: "0px",
			threshold: 1.0,
		};

		let observer = new IntersectionObserver((e) => {
			let shouldFloat = e.at(-1)?.isIntersecting || false;
			setIsIntersecting(shouldFloat);
		}, options);

		observer.observe(document.getElementById("observer-target")!);
		document.body.addEventListener("keydown", shortcutHandler);

		return () => {
			document.body.removeEventListener("keydown", shortcutHandler);
			observer.disconnect();
		};
	}, []);


	return (
		<AnimatePresence>
			{isFloating ? (
				<motion.div
					key='floating-creator'
					drag
					dragElastic={0}
					dragMomentum={false}
					initial={{
						scale: 0,
						left:
							floatingPosition.x > 0 ? floatingPosition.x : "50%",
						x: "-50%",
						top:
							floatingPosition.y > 0
								? floatingPosition.y
								: "10vh",
					}}
					onDragEnd={(e, info) => {
						let { x, y } = floatingPosition;
						setFloatingPosition({
							x: x + info.offset.x,
							y: y + info.offset.y,
						});
					}}
					animate={{
						scale: [0.7, 1],
					}}
					exit={{
						scale: [1, 0.7],
						opacity: 0,
					}}
					className='z-20 fixed overflow-hidden border-black dark:border-zinc-950 border-2 rounded-md md:w-[32rem] border-r-4 border-b-2 min-w-[21rem]'
					style={{
						backfaceVisibility: "hidden",
					}}
				>
					<PostCreator user={user}/>
				</motion.div>
			) : (
				<></>
			)}
		</AnimatePresence>
	);
}
