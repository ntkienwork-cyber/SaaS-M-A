"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InterestItem = {
  id: string;
  message: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    status: string;
    askingPrice: string | null;
    industry: string | null;
    province: string | null;
    businessProfile: { companyName: string };
  };
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive";
    message: string;
  }
> = {
  ACTIVE: {
    label: "Active",
    variant: "default",
    message: "This listing is currently available.",
  },
  INACTIVE: {
    label: "Paused",
    variant: "secondary",
    message: "The owner has temporarily paused this listing.",
  },
  SOLD: {
    label: "Sold",
    variant: "destructive",
    message: "This business has been sold.",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function InterestsList({ interests }: { interests: InterestItem[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      await fetch(`/api/interests/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemoving(null);
    }
  }

  if (!interests.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="font-medium">No interests recorded yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse listings and click &ldquo;I&apos;m interested&rdquo; to track them here
        </p>
        <Link
          href="/"
          className="mt-4 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interests.map((interest) => {
        const cfg = STATUS[interest.listing.status] ?? STATUS.INACTIVE;

        return (
          <article key={interest.id} className="rounded-xl border bg-card p-5 shadow-sm">
            {/* Top row: info + actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  {interest.listing.industry && (
                    <span className="text-xs text-muted-foreground">
                      {interest.listing.industry}
                    </span>
                  )}
                  {interest.listing.province && (
                    <span className="text-xs text-muted-foreground">
                      {interest.listing.province}
                    </span>
                  )}
                </div>
                <p className="font-semibold leading-snug">
                  {interest.listing.businessProfile.companyName}
                </p>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {interest.listing.title}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/listing/${interest.listing.id}`} tabIndex={-1}>
                  <Button variant="ghost" size="icon" title="View listing">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Remove interest"
                  disabled={removing === interest.id}
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemove(interest.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status message */}
            <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              {cfg.message}
            </p>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {interest.listing.askingPrice
                  ? `R\u00a0${formatMoney(interest.listing.askingPrice)}`
                  : "Price on request"}
              </span>
              <span>
                Expressed{" "}
                {new Date(interest.createdAt).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Investor's message (if any) */}
            {interest.message && (
              <div className="mt-3 border-t pt-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Your message</p>
                <p className="text-sm">{interest.message}</p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
