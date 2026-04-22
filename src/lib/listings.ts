import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ListingDetail = Prisma.ListingGetPayload<{
  include: {
    businessProfile: true;
    _count: { select: { interests: true } };
  };
}>;

export async function getListing(id: string): Promise<ListingDetail | null> {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      businessProfile: true,
      _count: { select: { interests: true } },
    },
  });
}
