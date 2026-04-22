import { prisma } from "@/lib/prisma";

interface UpsertUserParams {
  authId: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  provider: string;
}

export async function upsertUser(params: UpsertUserParams): Promise<void> {
  await prisma.user.upsert({
    where: { authId: params.authId },
    create: {
      authId: params.authId,
      email: params.email,
      phone: params.phone,
      name: params.name,
      avatarUrl: params.avatarUrl,
      provider: params.provider,
    },
    update: {
      email: params.email,
      phone: params.phone,
      name: params.name,
      avatarUrl: params.avatarUrl,
    },
  });
}
