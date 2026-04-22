import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getListing } from "@/lib/listings";
import { formatMoney, formatPercentage } from "@/lib/format";
import { ListingTabs } from "@/components/listings/listing-tabs";
import { InterestModal } from "@/components/listings/interest-modal";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Not found" };
  return {
    title: `${listing.businessProfile.companyName} — BizConnect`,
    description: listing.title,
  };
}

export default async function ListingPage({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) notFound();

  const bp = listing.businessProfile;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        {/* Hero */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {listing.industry && <Badge variant="secondary">{listing.industry}</Badge>}
              {listing.province && (
                <Badge variant="outline">{listing.province}</Badge>
              )}
              {listing.status !== "ACTIVE" && (
                <Badge variant="destructive">{listing.status}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{bp.companyName}</h1>
            <p className="mt-1 text-muted-foreground">{listing.title}</p>
          </div>

          <div className="shrink-0 rounded-xl border bg-card p-4 text-right shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Asking price
            </p>
            <p className="mt-0.5 text-2xl font-bold text-primary">
              {listing.askingPrice
                ? `R\u00a0${formatMoney(listing.askingPrice)}`
                : "On request"}
            </p>
            {listing.sharePercentage != null && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatPercentage(listing.sharePercentage)} share for sale
              </p>
            )}
            {listing._count.interests > 0 && (
              <p className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {listing._count.interests} interested
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <ListingTabs listing={listing} />

        {/* CTA */}
        {listing.status === "ACTIVE" && (
          <div className="mt-8 flex justify-end">
            <InterestModal listingId={listing.id} />
          </div>
        )}
      </main>
    </div>
  );
}
