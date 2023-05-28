import { createUser } from "@/utils/db/user";
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { SignInOptions } from "next-auth/react";
import { prisma } from "./prisma";

async function userCreator(profile: any) {
	let user = await prisma.user.findUnique({
		where: {
			email: profile.email as string,
		},
	});

	if (user == null) {
		user = await createUser(profile.name, profile.email, profile.picture);
	}

	return {
		...profile,
		id: user!.id,
	};
}

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/signin",
		signOut: "/signout",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},

		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id;
			}

			return session;
		},
		async signIn({ user }: SignInOptions) {
			const isAllowedToSignIn = true;
			if (isAllowedToSignIn) {
				// @ts-ignore
				// await createUser(user.name, user.email);
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
			async profile(profile) {
				return await userCreator(profile);
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID!,
			clientSecret: process.env.GOOGLE_SECRET!,
			async profile(profile) {
				return await userCreator(profile);
			},
		}),
	],
};

export default NextAuth(authOptions);
