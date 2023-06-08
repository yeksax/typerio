import GoBack from "@/components/GoBack";
import { prisma } from "@/services/prisma";
import DedicatedPost from "./DedicatedPost";
import { _Post } from "@/types/interfaces";

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
	function getReadableTime(time: number) {
		const weekDays = [
			"dom.",
			"seg.",
			"ter.",
			"qua.",
			"qui.",
			"sex.",
			"sáb.",
		];
		const yearMonths = [
			"jan.",
			"fev.",
			"mar.",
			"abr.",
			"mai.",
			"jun.",
			"jul.",
			"ago.",
			"set.",
			"out.",
			"nov.",
			"dez.",
		];

		let date = new Date(time);

		let weekDay = date.getDay();
		let day = date.getDate();
		let month = date.getMonth();
		let year = date.getFullYear();
		let hour = date.getHours();
		let minute = date.getMinutes();

		return `${weekDays[weekDay]}, ${day} de ${yearMonths[month]}, ${year} às ${hour}:${minute}`;
	}

	let post: _Post | null = await prisma.post.findUnique({
		where: { id: params.type },
		include: {
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
		<section className='h-full'>
			<div className='flex justify-between items-center px-8 py-2 border-b border-black'>
				<GoBack text='Voltar' className='font-bold' />
				<span className='text-gray-600 text-xs'>
					{post && getReadableTime(post.createdAt.getTime())}
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
		</section>
	);
}
