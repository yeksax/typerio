import Sidebar from "@/components/Sidebar/Sidebar";
import ChatSidebar from "./ChatsSidebar/ChatsSidebar";

export default async function ChatsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className='flex h-full overflow-hidden'>
			{/* @ts-ignore */}
			<Sidebar forceCollapse hasChatSidebar />
			<main className='h-full w-full flex relative overflow-hidden'>
				<ChatSidebar />
				{children}
			</main>
		</section>
	);
}
