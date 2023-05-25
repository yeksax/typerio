import Sidebar from "@/components/Sidebar/Sidebar";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<section className='flex h-full overflow-hidden'>
			{/* @ts-ignore */}
			<Sidebar/>
			<main
				className='h-full flex flex-col flex-1'
				style={{
					minWidth: "45%",
				}}
			>
				{children}
			</main>
			<aside className='hidden md:flex-1 md:block flex-1 border-l-2 border-black px-6 py-4'></aside>
		</section>
	);
}
