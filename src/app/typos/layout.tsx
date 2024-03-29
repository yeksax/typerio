import ChatSidebar from "./ChatsSidebar/ChatsSidebar";

export default async function ChatsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className='h-full w-full flex relative overflow-hidden'>
			<ChatSidebar />
			{children}
		</section>
	);
}
