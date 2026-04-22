"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "facebook", label: "Continue with Facebook" },
  { id: "apple", label: "Continue with Apple" },
] as const;

interface OAuthButtonsProps {
  callbackUrl?: string;
}

export function OAuthButtons({ callbackUrl = "/" }: OAuthButtonsProps) {
  return (
    <div className="space-y-2">
      {PROVIDERS.map(({ id, label }) => (
        <Button
          key={id}
          variant="outline"
          className="w-full"
          onClick={() => signIn(id, { callbackUrl })}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
