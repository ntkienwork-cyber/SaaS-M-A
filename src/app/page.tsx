import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">BizConnect</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Connect with businesses and opportunities
        </p>
      </div>
      <div className="flex gap-3">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </main>
  );
}
