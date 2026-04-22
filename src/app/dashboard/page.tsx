import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ListingsTable } from "./listings-table";
import { ListingFormDialog } from "./listing-form-dialog";

export const metadata = { title: "Dashboard — BizConnect" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { authId: session.user.id },
    include: {
      businessProfile: {
        include: {
          listings: {
            include: { _count: { select: { interests: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");
  if (user.role === "INVESTOR") redirect("/my-interests");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              BizConnect
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">/ Dashboard</span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Browse listings
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page title + New listing button */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My listings</h1>
            {user.businessProfile && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {user.businessProfile.companyName}
              </p>
            )}
          </div>

          <ListingFormDialog
            trigger={
              <Button disabled={!user.businessProfile}>
                <Plus className="mr-1.5 h-4 w-4" />
                New listing
              </Button>
            }
          />
        </div>

        {/* No business profile guard */}
        {!user.businessProfile ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="font-medium">Business profile not set up yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A business profile is required before you can create listings.
              Contact support or use the API to create one.
            </p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["Total", user.businessProfile.listings.length],
                  [
                    "Active",
                    user.businessProfile.listings.filter((l) => l.status === "ACTIVE").length,
                  ],
                  [
                    "Closed",
                    user.businessProfile.listings.filter((l) => l.status === "INACTIVE").length,
                  ],
                  [
                    "Interests",
                    user.businessProfile.listings.reduce(
                      (sum, l) => sum + l._count.interests,
                      0
                    ),
                  ],
                ] as [string, number][]
              ).map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-card p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            {/* Listings */}
            <ListingsTable listings={user.businessProfile.listings as never} />
          </>
        )}
      </main>
    </div>
  );
}
