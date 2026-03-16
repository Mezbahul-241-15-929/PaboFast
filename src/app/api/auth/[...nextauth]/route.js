import { loginUser } from "@/app/action/auth/loginUser";
import dbConnect, { colletionNameObj } from "@/lib/dbConnect";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const getUserByEmail = async (email) => {
    const userCollection = dbConnect(colletionNameObj.userColletion);
    return userCollection.findOne({ email });
};

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const user = await loginUser(credentials);
                if (!user) return null;
                return user;
            }
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],

    pages: {
        signIn: "/signin"
    },

    callbacks: {

        // 🔥 THIS IS THE IMPORTANT FIX
        async signIn({ user, account, profile }) {

            // If Google login
            if (account?.provider === "google") {

                const dbUser = await getUserByEmail(profile.email);

                // ❌ If user NOT in database → redirect to signup
                if (!dbUser) {
                    return "/signup?error=not_registered";
                }

                // ✅ If user exists → allow login
                return true;
            }

            return true;
        },

        async jwt({ token, user, account }) {
            if (account) {
                token.provider = account.provider;
            }

            if (user) {
                token.user = user;
            }

            return token;
        },

        async session({ session, token }) {
            session.user = session.user || {};
            session.user.provider = token.provider;
            session.user.dbUser = token.user;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };