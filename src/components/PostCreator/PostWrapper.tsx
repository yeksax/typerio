"use client";

import { User } from "@prisma/client";
import FloatingCreator from "./FloatingCreator";
import PostCreator from "./PostCreator";
import { useAtomValue } from "jotai";
import { creatorFloat } from "@/atoms/creatorState";

export default function PostCreatorWrapper({ user }: { user: User }) {
	const isFloating = useAtomValue(creatorFloat);

	return (
		<>
			<FloatingCreator user={user} />
			<div className={`${isFloating ? "hidden" : "border-b-2 dark:border-zinc-950 border-black"}`}>
				<PostCreator user={user} />
			</div>
		</>
	);
}
