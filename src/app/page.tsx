"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FilterBar, type Filters } from "@/components/listings/filter-bar";
import { ListingsGrid } from "@/components/listings/listings-grid";
import { Pagination } from "@/components/listings/pagination";
import type { ListingCardData } from "@/components/listings/listing-card";

interface ListingsPage {
  items: ListingCardData[];
  total: number;
  page: number;
  totalPages: number;
}

const DEFAULT_FILTERS: Filters = {
  industry: "",
  province: "",
  minPrice: "",
  maxPrice: "",
  minShare: "",
  maxShare: "",
};

export default function HomePage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const dashboardHref = role === "OWNER" ? "/dashboard" : "/my-interests";

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ListingsPage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (filters.industry) params.set("industry", filters.industry);
    if (filters.province) params.set("province", filters.province);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minShare) params.set("minShare", filters.minShare);
    if (filters.maxShare) params.set("maxShare", filters.maxShare);

    try {
      const res = await fetch(`/api/listings?${params}`);
      const json = (await res.json()) as { data: ListingsPage };
      setResult(json.data);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  function handleFilterChange(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">BizConnect</span>
          <nav className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {role === "OWNER" ? "Dashboard" : "My interests"}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Browse businesses</h1>
          <p className="mt-1 text-muted-foreground">
            Find your next investment opportunity across South Africa
          </p>
        </div>

        <FilterBar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />

        <ListingsGrid
          items={result?.items ?? []}
          loading={loading}
          total={result?.total ?? 0}
        />

        {result && result.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={result.totalPages}
            onPageChange={setPage}
          />
        )}
      </main>
    </div>
  );
}
