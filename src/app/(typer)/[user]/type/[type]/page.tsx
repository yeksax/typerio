import GoBack from "@/components/GoBack";
import { prisma } from "@/services/prisma";
import DedicatedPost from "./DedicatedPost";
import { _Post } from "@/types/interfaces";
import { getFullDate } from "@/utils/client/readableTime";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
	params: {
		user: string;
		type: string; // (post alias yk, give it some personality)
	};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const post = await prisma.post.findUnique({
		where: {
			id: params.type,
		},
		select: {
			attachments: true,
			author: {
				select: {
					name: true,
					avatar: true,
				},
			},
			replied: {
				select: {
					author: {
						select: {
							name: true,
							avatar: true,
						},
					},
				},
			},
			content: true,
			_count: {
				select: {
					attachments: true,
				},
			},
		},
	});

	const exists = post != null;
	const isReply = !!post?.replied;

	if (!exists)
		return {
			title: "Type inexistente </3",
		};

	let title = "";

	isReply ? (title += `Respondendo ${post.replied!.author.name}, `) : null;
	title += `${post.author.name} disse "${post.content}"`;

	return {
		title,
		twitter: {
			title,
			description: post.content,
			images:
				post.attachments.length > 0
					? post.attachments[0].url
					: post.author.avatar,
		},
	};
}

export default async function PostPage({ params }: Props) {
	let post: _Post | null = await prisma.post.findFirst({
		where: { id: params.type, deleted: false },
		include: {
			attachments: true,
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
					replies: {
						where: {
							deleted: false,
						},
					},
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
							replies: {
								where: {
									deleted: false,
								},
							},
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
				<GoBack className='font-bold' />
				<span className='opacity-80 text-xs'>
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
