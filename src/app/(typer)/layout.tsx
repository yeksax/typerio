export const fetchCache = "no-store";
export const dynamic = "force-dynamic";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<section className='flex h-full overflow-hidden'>
			<aside className='flex-1 border-r-2 border-black px-6 py-4'>
			</aside>
			<main
				className='h-full flex flex-col'
				style={{
					width: "45%",
				}}
			>
				{/* @ts-ignore */}
				{children}
			</main>
			<aside className='flex-1 border-l-2 border-black px-6 py-4'>
			</aside>
		</section>
	);
}
