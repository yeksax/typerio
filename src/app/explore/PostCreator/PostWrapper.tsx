import { prisma } from "@/services/prisma";
import PostCreator from "./PostCreator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";

export default async function PostCreatorWrapper() {
	const session = await getServerSession(authOptions);
	if (!session) return <></>;

	const user = await prisma.user.findUnique({
		where: {
			id: session?.user?.id as string,
		},
	});

	return <PostCreator user={user!} />;
}
