"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney, formatNumber, formatPercentage } from "@/lib/format";
import type { ListingDetail } from "@/lib/listings";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-4 py-3 [&:not(:last-child)]:border-b">
      <dt className="w-44 shrink-0 text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-4 text-sm text-muted-foreground">{message}</p>;
}

interface ListingTabsProps {
  listing: ListingDetail;
}

export function ListingTabs({ listing }: ListingTabsProps) {
  const bp = listing.businessProfile;

  const financeRows = [
    listing.askingPrice,
    listing.sharePercentage,
    listing.annualRevenue,
    listing.netProfit,
  ].filter(Boolean);

  const opsRows = [listing.employeeCount, listing.yearEstablished, listing.operatingHours].filter(
    (v) => v != null
  );

  return (
    <Tabs defaultValue="basic">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="finance">Finance</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="reason">Reason for Selling</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <dl className="mt-4 rounded-xl border p-4">
          <InfoRow label="Business name" value={bp.companyName} />
          <InfoRow label="Industry / sector" value={listing.industry} />
          <InfoRow label="Province" value={listing.province} />
          <InfoRow label="Location" value={listing.location} />
          <InfoRow
            label="Website"
            value={
              bp.website ? (
                <a
                  href={bp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {bp.website}
                </a>
              ) : null
            }
          />
          <InfoRow label="Description" value={listing.description} />
        </dl>
      </TabsContent>

      <TabsContent value="finance">
        <dl className="mt-4 rounded-xl border p-4">
          {financeRows.length === 0 ? (
            <EmptyState message="No financial information provided." />
          ) : (
            <>
              <InfoRow
                label="Asking price"
                value={
                  listing.askingPrice
                    ? `R\u00a0${formatMoney(listing.askingPrice)}`
                    : "On request"
                }
              />
              <InfoRow
                label="Share for sale"
                value={
                  listing.sharePercentage != null
                    ? formatPercentage(listing.sharePercentage)
                    : null
                }
              />
              <InfoRow
                label="Annual revenue"
                value={
                  listing.annualRevenue
                    ? `R\u00a0${formatMoney(listing.annualRevenue)}`
                    : null
                }
              />
              <InfoRow
                label="Net profit (p.a.)"
                value={
                  listing.netProfit ? `R\u00a0${formatMoney(listing.netProfit)}` : null
                }
              />
            </>
          )}
        </dl>
      </TabsContent>

      <TabsContent value="operations">
        <dl className="mt-4 rounded-xl border p-4">
          {opsRows.length === 0 ? (
            <EmptyState message="No operations information provided." />
          ) : (
            <>
              <InfoRow
                label="Employees"
                value={
                  listing.employeeCount != null ? formatNumber(listing.employeeCount) : null
                }
              />
              <InfoRow label="Year established" value={listing.yearEstablished} />
              <InfoRow label="Operating hours" value={listing.operatingHours} />
            </>
          )}
        </dl>
      </TabsContent>

      <TabsContent value="reason">
        <div className="mt-4 rounded-xl border p-4">
          {listing.reasonForSelling ? (
            <p className="text-sm leading-relaxed">{listing.reasonForSelling}</p>
          ) : (
            <EmptyState message="No reason for selling provided." />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
