"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, ExternalLink, Pencil, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatPercentage } from "@/lib/format";
import { ListingFormDialog } from "./listing-form-dialog";

// ─── Serialised type (Decimal → string, Date → string after JSON) ─────────────

export type DashboardListing = {
  id: string;
  title: string;
  description: string;
  industry: string | null;
  province: string | null;
  location: string | null;
  status: string;
  askingPrice: string | null;
  sharePercentage: string | null;
  annualRevenue: string | null;
  netProfit: string | null;
  employeeCount: number | null;
  yearEstablished: number | null;
  operatingHours: string | null;
  reasonForSelling: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { interests: number };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  SOLD: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Closed",
  SOLD: "Sold",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingsTable({ listings }: { listings: DashboardListing[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function patchStatus(id: string, status: string) {
    setBusy(id);
    try {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (!listings.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="font-medium">No listings yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first listing using the button above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
        >
          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_BADGE[listing.status] ?? "outline"}>
                {STATUS_LABEL[listing.status] ?? listing.status}
              </Badge>
              {listing.industry && (
                <span className="text-xs text-muted-foreground">{listing.industry}</span>
              )}
              {listing.province && (
                <span className="text-xs text-muted-foreground">{listing.province}</span>
              )}
            </div>

            <p className="truncate font-semibold leading-snug">{listing.title}</p>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
              {listing.askingPrice && (
                <span>R&nbsp;{formatMoney(listing.askingPrice)}</span>
              )}
              {listing.sharePercentage && (
                <span>{formatPercentage(listing.sharePercentage)} share</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Interest count */}
            <span className="mr-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {listing._count.interests}
            </span>

            {/* View public listing */}
            <Link href={`/listing/${listing.id}`} tabIndex={-1}>
              <Button variant="ghost" size="icon" title="View public listing">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>

            {/* Edit */}
            <ListingFormDialog
              trigger={
                <Button variant="ghost" size="icon" title="Edit listing">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
              listing={listing}
            />

            {/* Status toggle */}
            {listing.status === "ACTIVE" && (
              <Button
                variant="ghost"
                size="icon"
                title="Close listing"
                disabled={busy === listing.id}
                onClick={() => patchStatus(listing.id, "INACTIVE")}
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            {listing.status === "INACTIVE" && (
              <Button
                variant="ghost"
                size="icon"
                title="Reactivate listing"
                disabled={busy === listing.id}
                onClick={() => patchStatus(listing.id, "ACTIVE")}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
