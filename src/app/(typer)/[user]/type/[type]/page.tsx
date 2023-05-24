import GoBack from "@/components/GoBack";
import { prisma } from "@/services/prisma";
import DedicatedPost from "./DedicatedPost";

export const metadata = {
	title: "Typer | Post",
};

export const dynamic = "force-dynamic"

interface Props {
	params: {
		user: string;
		type: string; // (post alias yk, give it some personality)
	};
}

export default async function PostPage({ params }: Props) {
	const post = await fetch(
		`${process.env.PAGE_URL}/api/posts/${params.type}`
	).then((res) => res.json());

	return (
		<>
			<div className='flex justify-between px-8 py-2 border-b-2 border-black'>
				<GoBack text='Voltar' className='font-bold' />
			</div>
			<DedicatedPost post={post!} />
		</>
	);
}
