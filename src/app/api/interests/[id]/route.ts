import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ok, err } from "@/lib/api";

type Params = Promise<{ id: string }>;

// DELETE /api/interests/:id  — investor removes their own interest
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);

  const interest = await prisma.interest.findUnique({ where: { id } });
  if (!interest) return err("Not found", 404);
  if (interest.investorId !== user.id) return err("Forbidden", 403);

  await prisma.interest.delete({ where: { id } });
  return ok({ message: "Interest removed" });
}
