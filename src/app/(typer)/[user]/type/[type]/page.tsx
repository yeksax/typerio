import GoBack from "@/components/GoBack";
import { prisma } from "@/services/prisma";
import DedicatedPost from "./DedicatedPost";

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
	let post = await fetch(
		`${process.env.PAGE_URL}/api/posts/${params.type}`
	).then((res) => res.json());

	return (
		<section className="h-full">
			<div className='flex justify-between px-8 py-2 border-b-2 border-black'>
				<GoBack text='Voltar' className='font-bold' />
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
