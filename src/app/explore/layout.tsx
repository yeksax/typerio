import PostCreator from "./PostCreator/PostCreator";
import PostCreatorWrapper from "./PostCreator/PostWrapper";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<section className='flex h-full overflow-hidden'>
			<aside className='flex-1 border-r-2 border-black px-6 py-4'>
				oi
			</aside>
			<main className='w-1/2 h-full flex flex-col'>
				{/* @ts-ignore */}
				<PostCreatorWrapper />
				{children}
			</main>
			<aside className='flex-1 border-l-2 border-black px-6 py-4'>
				oi
			</aside>
		</section>
	);
}
