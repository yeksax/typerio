export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className='border-b-2 border-black px-4 md:px-8 text-base font-semibold py-1 md:py-2'>
				Configurações
			</div>
			{children}
		</>
	);
}
