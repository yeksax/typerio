import { prisma } from "@/services/prisma";
import { _User } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import UserCard from "@/components/UserComponents/UserCard";

interface Props {
	params: {
		user: string;
	};
}

export default async function FollowersPage({ params }: Props) {
	const session = await getServerSession(authOptions);

	const user = await prisma.user.findUnique({
		where:
			params.user === "me"
				? {
						id: session?.user?.id,
				  }
				: {
						username: params.user,
				  },
		select: {
			followers: {
				include: {
					_count: {
						select: {
							followers: true,
							following: true,
						},
					},
					followers: {
						where: session
							? {
									id: session.user!.id,
							  }
							: {
									id: "null",
							  },
					},
					following: {
						where: session
							? {
									id: session.user!.id,
							  }
							: {
									id: "null",
							  },
					},
				},
			},
		},
	});

	return (
		<div className="pb-[100%] flex flex-col gap-2 md:gap-4">
			{user?.followers.map((user) => (
				<UserCard session={session} user={user} />
			))}
		</div>
	);
}
