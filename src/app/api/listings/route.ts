import { type NextRequest } from "next/server";
import { Prisma, type ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ok, err } from "@/lib/api";

const VALID_STATUSES: ListingStatus[] = ["ACTIVE", "INACTIVE", "SOLD"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const industry = searchParams.get("industry") ?? undefined;
  const rawStatus = searchParams.get("status") as ListingStatus | null;
  const status: ListingStatus = rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : "ACTIVE";

  const where: Prisma.ListingWhereInput = { status, ...(industry && { industry }) };

  const [total, items] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: {
        businessProfile: { select: { companyName: true, logoUrl: true } },
        _count: { select: { interests: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return ok({ items, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  if (user.role !== "OWNER") return err("Only business owners can create listings", 403);

  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return err("Business profile not found — create one first", 422);

  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON body", 400);

  const { title, description, askingPrice, annualRevenue, industry, location } =
    body as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim()) return err("title is required", 400);
  if (typeof description !== "string" || !description.trim())
    return err("description is required", 400);

  const listing = await prisma.listing.create({
    data: {
      businessProfileId: profile.id,
      title: title.trim(),
      description: description.trim(),
      askingPrice: askingPrice != null ? new Prisma.Decimal(String(askingPrice)) : null,
      annualRevenue: annualRevenue != null ? new Prisma.Decimal(String(annualRevenue)) : null,
      industry: typeof industry === "string" ? industry.trim() || null : null,
      location: typeof location === "string" ? location.trim() || null : null,
    },
  });

  return ok(listing, 201);
}
