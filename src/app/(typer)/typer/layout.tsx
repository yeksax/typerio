import PostCreatorWrapper from "@/components/PostCreator/PostWrapper";
import { authOptions } from "@/services/auth";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";

const infrastructureIssue = (
	<div className='px-8 py-4 border-b-2  dark:bg-zinc-900 border-black text-center bg-gray-50 text-sm'>
		Atualizações na infraestrutura foram realizadas. Por favor, faça o{" "}
		<Link
			className='text-blue-600 dark:text-blue-400 opacity-80 font-bold'
			href='/signin'
		>
			Login
		</Link>{" "}
		novamente para poder compartilhar suas ideias &lt;3.
	</div>
);

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	let user: User | null | undefined;

	if (session) {
		if (!session?.user) return;
		if (!session?.user?.id) return;

		user = await prisma.user.findUnique({
			where: {
				id: session.user.id,
			},
		});

		if (!user) return;
	}

	return (
		<>
			{user && (
				<>
					<PostCreatorWrapper user={user} />
					<div id='observer-target'></div>
				</>
			)}

			{session && !user && infrastructureIssue}

			{children}
		</>
	);
}
