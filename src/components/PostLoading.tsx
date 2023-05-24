"use client";

import { pusherClient } from "@/services/pusher";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Props {
	listener: string;
	position: "top" | "bottom"
}

export default function PostLoading({ listener, position = 'top' }: Props) {
	const [percent, setPercent] = useState(0);
	const { data: session } = useSession();

	const channel = `${session?.user?.id}__${listener}`;

	useEffect(() => {
		pusherClient.unsubscribe(channel);

		pusherClient.subscribe(channel).bind("progress", (data: number) => {
			setPercent(data);
		});
	}, [channel, session?.user?.id]);

	return (
		<motion.div
			className={`bg-black absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 loading-bar`}
			initial={{ width: "0%", height: "3px" }}
			animate={{
				width: `${percent}%`,
				height: "3px",
			}}
		></motion.div>
	);
}
