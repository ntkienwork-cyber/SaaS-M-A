import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string | null;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    role?: string;
  }
}
