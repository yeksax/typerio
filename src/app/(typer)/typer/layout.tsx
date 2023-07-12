import FloatingCreator from "@/components/PostCreator/FloatingCreator";
import PostCreatorWrapper from "@/components/PostCreator/PostWrapper";

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{/* @ts-ignore */}
			<PostCreatorWrapper />
			<div id='observer-target'></div>
			{children}
		</>
	);
}
