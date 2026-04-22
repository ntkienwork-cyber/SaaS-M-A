import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatPercentage } from "@/lib/format";

export interface ListingCardData {
  id: string;
  title: string;
  industry: string | null;
  province: string | null;
  askingPrice: string | null;
  sharePercentage: string | null;
  status: string;
  businessProfile: { companyName: string; logoUrl: string | null };
  _count: { interests: number };
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link href={`/listing/${listing.id}`} className="group block h-full">
      <article className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          {listing.industry ? (
            <Badge variant="secondary" className="shrink-0">
              {listing.industry}
            </Badge>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {listing._count.interests}{" "}
            {listing._count.interests === 1 ? "interested" : "interested"}
          </span>
        </div>

        <h3 className="mb-1 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-1">
          {listing.businessProfile.companyName}
        </h3>

        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">{listing.title}</p>

        <div className="flex items-end justify-between gap-2 border-t pt-3">
          <div className="min-w-0 space-y-0.5">
            {listing.province && (
              <p className="truncate text-xs text-muted-foreground">{listing.province}</p>
            )}
            {listing.sharePercentage != null && (
              <p className="text-sm font-medium">
                <span className="text-muted-foreground">Share: </span>
                {formatPercentage(listing.sharePercentage)}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">Asking price</p>
            <p className="text-lg font-bold text-primary">
              {listing.askingPrice ? `R\u00a0${formatMoney(listing.askingPrice)}` : "On request"}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
