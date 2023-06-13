"use server";

import { prisma } from "@/services/prisma";
import ProfilePosts from "./ProfilePosts";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { _Post } from "@/types/interfaces";
import { getProfilePosts } from "./actions";
import Head from "next/head";

interface Props {
	params: {
		user: string;
	};
}

const postsPerPage = 20;

export default async function UserPage({ params }: Props) {
	const session = await getServerSession(authOptions);

	const posts = await getProfilePosts(1, params.user, session);

	return (
		<>
			<ProfilePosts
				profile={params.user}
				session={session}
				posts={posts}
			/>
		</>
	);
}
