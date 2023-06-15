import { withAuth } from "next-auth/middleware";

export default withAuth(
	// `withAuth` augments your `Request` with the user's token.
	function middleware(req) {
		// console.log(req.nextauth.token);
	},
	{
		callbacks: {
			authorized: ({ token }) => {
				return !!token;
			},
		},
	}
);

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		"/typos/:path*",
		"/notifications/:path*",
		"/settings/:path*",
		"/me/:path*",
	],
};
