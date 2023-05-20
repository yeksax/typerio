import { createUser } from "@/utils/db/user";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { SignInOptions } from "next-auth/react";

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/auth/signin",
	},
	callbacks: {
		async signIn({ user }: SignInOptions) {
			const isAllowedToSignIn = true;
			if (isAllowedToSignIn) {
				// @ts-ignore
				await createUser(user.name, user.email);
				return true;
			} else {
				// Return false to display a default error message
				return false;
				// Or you can return a URL to redirect to:
				// return '/unauthorized'
			}
		},
	},
	// Configure one or more authentication providers
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID!,
			clientSecret: process.env.GOOGLE_SECRET!,
		}),
	],
};

export default NextAuth(authOptions);
