"use client";

import { pusherClient } from "@/services/pusher";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Props {
	listener: string;
	position: "top" | "bottom";
}

export default function LoadingBar({ listener, position = "top" }: Props) {
	const [percent, setPercent] = useState(0);
	const { data: session } = useSession();

	useEffect(() => {
		const channel = `${session?.user?.id}__${listener}`;

		pusherClient.subscribe(channel).bind("progress", (data: number) => {
			setPercent(data);
		});

		return () => {
			pusherClient.unsubscribe(channel);
		}
	}, [session?.user]);

	return (
		<motion.div
			className={`loading-bar overflow-hidden ${
				percent != 0 ? "loading" : ""
			} bg-black absolute ${
				position === "top" ? "top-0" : "bottom-0"
			} left-0`}
			initial={{ width: "0%", height: "3px" }}
			animate={{
				width: `${percent}%`,
				height: "3px",
			}}
		></motion.div>
	);
}
