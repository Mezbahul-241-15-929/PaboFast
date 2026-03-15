import { loginUser } from "@/app/action/auth/loginUser";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        })
    ],
    pages: {
        signIn: "/login"
    }
    ,

        // callbacks: {
    //   async session({ session, token, user }) {
    //     if(token){
    //       session.user.username=token.username;
    //       session.user.role= token.role;
    //     }
    //     return session
    //   },
    //   async jwt({ token, user, account, profile, isNewUser }) {
    //     if(user){
    //       token.username=user.username;
    //       token.role=user.role;
    //     }
    //     return token
    //   }
    // }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
