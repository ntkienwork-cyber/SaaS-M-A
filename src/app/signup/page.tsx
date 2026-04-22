import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Sign up — BizConnect" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            {"Already have an account? "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>
          </p>
        </div>

        <OAuthButtons callbackUrl="/" />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or sign up with phone</span>
          <Separator className="flex-1" />
        </div>

        <PhoneOtpForm callbackUrl="/" />
      </div>
    </main>
  );
}
