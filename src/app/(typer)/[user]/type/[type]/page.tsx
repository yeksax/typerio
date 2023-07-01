import GoBack from "@/components/GoBack";
import { prisma } from "@/services/prisma";
import DedicatedPost from "./DedicatedPost";
import { _Post } from "@/types/interfaces";
import { getFullDate } from "@/utils/client/readableTime";

export const metadata = {
	title: "Typer | Post",
};

export const dynamic = "force-dynamic";

interface Props {
	params: {
		user: string;
		type: string; // (post alias yk, give it some personality)
	};
}

export default async function PostPage({ params }: Props) {
	let post: _Post | null = await prisma.post.findFirst({
		where: { id: params.type, deleted: false },
		include: {
			attachments: true,
			invite: {
				include: {
					owner: true,
					chat: {
						include: {
							_count: {
								select: {
									members: true,
								},
							},
						},
					},
				},
			},
			author: true,
			likedBy: true,
			thread: {
				orderBy: {
					createdAt: "asc",
				},
				include: {
					attachments: true,
					likedBy: true,
					author: true,
					_count: {
						select: {
							replies: true,
							likedBy: true,
						},
					},
				},
			},
			_count: {
				select: {
					replies: true,
					likedBy: true,
				},
			},
			replies: {
				where: {
					deleted: false,
				},
				include: {
					author: true,
					likedBy: true,
					_count: {
						select: {
							replies: true,
							likedBy: true,
						},
					},
				},
			},
		},
	});

	return (
		<>
			<div className='flex justify-between items-center px-8 py-2 border-b-2 border-black'>
				<GoBack text='Voltar' className='font-bold' />
				<span className='text-gray-600 text-xs'>
					{post && getFullDate(post.createdAt.getTime())}
				</span>
			</div>
			{post ? (
				<DedicatedPost post={post} />
			) : (
				<div className='flex flex-col items-center justify-center w-full h-full'>
					<h1 className='text-xl font-medium text-gray-500'>
						Esse post foi excluído 👀...
					</h1>
				</div>
			)}
		</>
	);
}
