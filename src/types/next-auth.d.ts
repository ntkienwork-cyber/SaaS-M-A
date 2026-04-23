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

// next-auth v5 (beta) resolves JWT from @auth/core/jwt
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    role?: string;
  }
}
