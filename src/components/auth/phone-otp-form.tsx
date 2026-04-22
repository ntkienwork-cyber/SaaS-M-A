"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "phone" | "otp";

interface PhoneOtpFormProps {
  callbackUrl?: string;
}

export function PhoneOtpForm({ callbackUrl = "/" }: PhoneOtpFormProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  async function sendOtp() {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();

      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
          size: "invisible",
        });
      }

      confirmationRef.current = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
      setStep("otp");
    } catch {
      setError("Failed to send OTP. Verify the number includes the country code (+1…).");
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!confirmationRef.current) return;
    setError(null);
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const firebaseToken = await result.user.getIdToken();
      await signIn("phone", { firebaseToken, callbackUrl });
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div ref={recaptchaContainerRef} />

      {step === "phone" ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={sendOtp} disabled={loading || !phone} className="w-full">
            {loading ? "Sending…" : "Send verification code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Code sent to <span className="font-medium text-foreground">{phone}</span>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={verifyOtp} disabled={loading || otp.length < 6} className="w-full">
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setError(null);
            }}
          >
            Use a different number
          </Button>
        </div>
      )}
    </div>
  );
}
