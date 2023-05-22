"use client";

import { pusherClient } from "@/services/pusher";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PostLoading() {
	const [percent, setPercent] = useState(0);
	const { data: session } = useSession();

	useEffect(() => {
		pusherClient.unsubscribe(`${session?.user?.email}__post-loading`);

		pusherClient
			.subscribe(`${session?.user?.email}__post-loading`)
			.bind("progress", (data: number) => {
				setPercent(data);
			});
	}, [session?.user?.email]);

	return (
		<motion.div
			className='bg-black'
			initial={{ width: "0%", height: "3px" }}
			animate={{
				width: `${percent}%`,
				height: "3px",
			}}
		></motion.div>
	);
}
