export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return <div className='h-fit w-full'>{children}</div>;
}
