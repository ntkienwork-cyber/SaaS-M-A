"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INDUSTRIES, PROVINCES } from "@/lib/constants";

export interface Filters {
  industry: string;
  province: string;
  minPrice: string;
  maxPrice: string;
  minShare: string;
  maxShare: string;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

interface FilterBarProps {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
}

export function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
  const hasActive = Object.values(filters).some(Boolean);

  return (
    <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Industry</label>
          <select
            value={filters.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">All industries</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Province</label>
          <select
            value={filters.province}
            onChange={(e) => onChange("province", e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">All provinces</option>
            {PROVINCES.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Min price (R)</label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Max price (R)</label>
          <Input
            type="number"
            min={0}
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Min share %</label>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="0"
            value={filters.minShare}
            onChange={(e) => onChange("minShare", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Max share %</label>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="100"
            value={filters.maxShare}
            onChange={(e) => onChange("maxShare", e.target.value)}
          />
        </div>
      </div>

      {hasActive && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
