import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ok, err } from "@/lib/api";

// GET /api/interests?listingId=xxx  — listing owner sees who expressed interest
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);

  const listingId = new URL(req.url).searchParams.get("listingId");
  if (!listingId) return err("listingId query param is required", 400);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { businessProfile: { select: { userId: true } } },
  });
  if (!listing) return err("Listing not found", 404);
  if (listing.businessProfile.userId !== user.id) return err("Forbidden", 403);

  const interests = await prisma.interest.findMany({
    where: { listingId },
    include: { investor: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok(interests);
}

// POST /api/interests  — authenticated investor expresses interest in a listing
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  if (user.role !== "INVESTOR") return err("Only investors can express interest", 403);

  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON body", 400);

  const { listingId, message } = body as Record<string, unknown>;
  if (typeof listingId !== "string" || !listingId) return err("listingId is required", 400);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return err("Listing not found", 404);
  if (listing.status !== "ACTIVE") return err("Listing is not active", 422);

  const interest = await prisma.interest.upsert({
    where: { listingId_investorId: { listingId, investorId: user.id } },
    create: {
      listingId,
      investorId: user.id,
      message: typeof message === "string" ? message.trim() || null : null,
    },
    update: {
      message: typeof message === "string" ? message.trim() || null : null,
    },
  });

  return ok(interest, 201);
}
