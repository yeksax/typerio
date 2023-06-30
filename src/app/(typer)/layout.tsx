
export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			id='main-scroller'
			className='h-full flex flex-col overflow-y-auto overflow-x-hidden border-scroll'
		>
			{children}
		</div>
	);
}
