import { prisma } from "@/services/prisma";
import PostCreator from "./PostCreator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { signOut } from "next-auth/react";

export default async function PostCreatorWrapper() {
	const session = await getServerSession(authOptions);
	if (!session) return <></>;

	const user = await prisma.user.findUnique({
		where: {
			id: session?.user?.id as string,
		},
	});

	if (!user) {
		return <div
    className="px-8 py-4 border-b-2 border-black text-center bg-gray-50 text-sm">
      Atualizações na infraestrutura foram realizadas. Por favor, faça o login novamente para poder compartilhar suas ideias ao mundo &lt;3;.
    </div>;
	}

	return <PostCreator user={user!} />;
}
