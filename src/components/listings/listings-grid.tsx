import { ListingCard, type ListingCardData } from "./listing-card";
import { Skeleton } from "@/components/ui/skeleton";

function ListingCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mb-1 h-5 w-3/4" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-5/6" />
      <div className="flex justify-between border-t pt-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="ml-auto h-3 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    </div>
  );
}

interface ListingsGridProps {
  items: ListingCardData[];
  loading: boolean;
  total: number;
}

export function ListingsGrid({ items, loading, total }: ListingsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="text-base font-medium text-foreground">No listings found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your filters</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">{total} listing{total !== 1 ? "s" : ""}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
}
