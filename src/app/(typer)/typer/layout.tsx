import PostCreatorWrapper from "@/components/PostCreator/PostWrapper";

export const metadata = {
	title: "Explorar",
}

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col overflow-y-scroll overflow-x-hidden border-scroll">
			{/* @ts-ignore */}
			<PostCreatorWrapper />
			{children}
		</div>
	);
}
