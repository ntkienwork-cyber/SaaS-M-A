import { type NextRequest } from "next/server";
import { Prisma, type ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { ok, err } from "@/lib/api";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      businessProfile: {
        select: { companyName: true, logoUrl: true, website: true, industry: true },
      },
      _count: { select: { interests: true } },
    },
  });

  if (!listing) return err("Not found", 404);
  return ok(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { businessProfile: { select: { userId: true } } },
  });

  if (!listing) return err("Not found", 404);
  if (listing.businessProfile.userId !== user.id) return err("Forbidden", 403);

  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON body", 400);

  const { title, description, askingPrice, annualRevenue, industry, location, status } =
    body as Record<string, unknown>;

  const VALID_STATUSES: ListingStatus[] = ["ACTIVE", "INACTIVE", "SOLD"];

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ...(typeof title === "string" && title.trim() && { title: title.trim() }),
      ...(typeof description === "string" &&
        description.trim() && { description: description.trim() }),
      ...(askingPrice !== undefined && {
        askingPrice: askingPrice != null ? new Prisma.Decimal(String(askingPrice)) : null,
      }),
      ...(annualRevenue !== undefined && {
        annualRevenue: annualRevenue != null ? new Prisma.Decimal(String(annualRevenue)) : null,
      }),
      ...(typeof industry === "string" && { industry: industry.trim() || null }),
      ...(typeof location === "string" && { location: location.trim() || null }),
      ...(typeof status === "string" &&
        VALID_STATUSES.includes(status as ListingStatus) && {
          status: status as ListingStatus,
        }),
    },
  });

  return ok(updated);
}
