export const metadata = {
	title: "Configurações",
};

export default async function ExploreLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
