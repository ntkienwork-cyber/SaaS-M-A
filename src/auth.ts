import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyFirebaseToken } from "@/lib/firebase-admin";
import { upsertUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
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

        const dbUser = await prisma.user.findUnique({
          where: { authId: user.id! },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "INVESTOR";
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone ?? null;
      session.user.role = (token.role as string) ?? "INVESTOR";
      return session;
    },
  },
});
