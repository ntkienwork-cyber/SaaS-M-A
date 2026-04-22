import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { upsertUser } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: "phone",
      name: "Phone",
      credentials: {
        firebaseToken: { label: "Firebase Token", type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.firebaseToken as string | undefined;
        if (!token) return null;

        const decoded = await verifyFirebaseToken(token);
        if (!decoded) return null;

        return {
          id: decoded.uid,
          email: decoded.email ?? null,
          name: decoded.name ?? null,
          image: decoded.picture ?? null,
          phone: decoded.phone_number ?? null,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      try {
        await upsertUser({
          authId: user.id!,
          email: user.email ?? null,
          phone: (user as { phone?: string | null }).phone ?? null,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
          provider: account?.provider ?? "phone",
        });
        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.phone = (user as { phone?: string | null }).phone ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone ?? null;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
});
