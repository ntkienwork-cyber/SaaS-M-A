"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type SubmitState = "idle" | "loading" | "success" | "error";

interface InterestModalProps {
  listingId: string;
}

export function InterestModal({ listingId }: InterestModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit() {
    setState("loading");
    setErrorText("");

    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message: message.trim() || undefined }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorText((json as { error?: string }).error ?? "Something went wrong.");
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorText("Network error. Please try again.");
      setState("error");
    }
  }

  function handleOpenChange(next: boolean) {
    if (state === "loading") return;
    setOpen(next);
    if (!next) {
      setMessage("");
      setState("idle");
      setErrorText("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">I&apos;m interested</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {state === "success" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
              ✓
            </div>
            <p className="text-base font-semibold">Interest recorded!</p>
            <p className="text-sm text-muted-foreground">
              The owner has been notified and may reach out to you.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Express interest</DialogTitle>
              <DialogDescription>
                Send an optional message to the owner. Your contact details will be shared with
                them.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="interest-message">Message (optional)</Label>
              <Textarea
                id="interest-message"
                placeholder="Introduce yourself and describe your interest in this business…"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={state === "loading"}
              />
              {state === "error" && (
                <p className="text-sm text-destructive">{errorText}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                disabled={state === "loading"}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={state === "loading"}>
                {state === "loading" ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
