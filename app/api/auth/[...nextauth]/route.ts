import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  debug: true, // hata ayıklama için
  secret: process.env.NEXTAUTH_SECRET, // .env.local içinde NEXTAUTH_SECRET tanımlayın
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        // fallback ile base url
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/auth/login`, {
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
