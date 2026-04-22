import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InterestsList } from "./interests-list";

export const metadata = { title: "My Interests — BizConnect" };

export default async function MyInterestsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { authId: session.user.id },
  });

  if (!user) redirect("/login");
  if (user.role === "OWNER") redirect("/dashboard");

  const interests = await prisma.interest.findMany({
    where: { investorId: user.id },
    include: {
      listing: {
        include: {
          businessProfile: { select: { companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              BizConnect
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">/ My Interests</span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Browse listings
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">My interests</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {interests.length === 0
              ? "Businesses you express interest in will appear here"
              : `${interests.length} listing${interests.length !== 1 ? "s" : ""} tracked`}
          </p>
        </div>

        <InterestsList interests={interests as never} />
      </main>
    </div>
  );
}
