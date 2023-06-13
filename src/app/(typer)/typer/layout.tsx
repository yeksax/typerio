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
		<>
			{/* @ts-ignore */}
			<PostCreatorWrapper />
			{children}
		</>
	);
}
