import Sidebar from "@/components/Sidebar/Sidebar";
import Link from "next/link";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			id='main-scroller'
			className='h-full md:w-[32rem] flex flex-col overflow-y-auto overflow-x-hidden border-scroll'
		>
			{children}
		</div>
	);
}
