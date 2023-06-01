import Sidebar from "@/components/Sidebar/Sidebar";
import Link from "next/link";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<main className='flex h-full overflow-hidden'>
			{/* @ts-ignore */}
			<Sidebar forceCollapse />
			<div className="h-fit w-full">{children}</div>
		</main>
	);
}
