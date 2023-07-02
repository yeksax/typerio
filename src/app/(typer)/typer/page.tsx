import { authOptions } from "@/services/auth";
import { getPosts } from "@/utils/server/posts";
import { getServerSession } from "next-auth";
import Posts from "./Posts";

export const metadata = {
	title: "Explorar",
};

export default async function Page() {
	const session = await getServerSession(authOptions);
	const posts = await getPosts({ page: 1, session });

	return <Posts _posts={posts} session={session} />;
}
