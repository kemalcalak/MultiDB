import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        // biz kendi /api/auth/login endpoint’imize POST atıyoruz
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password
          })
        });
        const data = await res.json();
        if (res.ok && data.user) {
          // user objesinin içine token’ı ekleyelim
          return { ...data.user, token: data.token };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").DefaultUser }) {
      if (user) token.user = user;
      return token;
    },
    async session(
      { session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }
    ) {
      session.user = token.user as any;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
