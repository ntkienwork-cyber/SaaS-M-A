"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { INDUSTRIES, PROVINCES } from "@/lib/constants";
import type { DashboardListing } from "./listings-table";

// ─── Types ────────────────────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Finance", "Operations", "Reason for Selling"] as const;

interface FormValues {
  title: string;
  description: string;
  industry: string;
  province: string;
  location: string;
  status: string;
  askingPrice: string;
  sharePercentage: string;
  annualRevenue: string;
  netProfit: string;
  employeeCount: string;
  yearEstablished: string;
  operatingHours: string;
  reasonForSelling: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY: FormValues = {
  title: "",
  description: "",
  industry: "",
  province: "",
  location: "",
  status: "ACTIVE",
  askingPrice: "",
  sharePercentage: "",
  annualRevenue: "",
  netProfit: "",
  employeeCount: "",
  yearEstablished: "",
  operatingHours: "",
  reasonForSelling: "",
};

function toForm(listing: DashboardListing): FormValues {
  return {
    title: listing.title,
    description: listing.description,
    industry: listing.industry ?? "",
    province: listing.province ?? "",
    location: listing.location ?? "",
    status: listing.status,
    askingPrice: listing.askingPrice ?? "",
    sharePercentage: listing.sharePercentage ?? "",
    annualRevenue: listing.annualRevenue ?? "",
    netProfit: listing.netProfit ?? "",
    employeeCount: listing.employeeCount?.toString() ?? "",
    yearEstablished: listing.yearEstablished?.toString() ?? "",
    operatingHours: listing.operatingHours ?? "",
    reasonForSelling: listing.reasonForSelling ?? "",
  };
}

function validate(step: number, v: FormValues): FieldErrors {
  const e: FieldErrors = {};

  if (step === 1) {
    if (!v.title.trim()) e.title = "Title is required";
    else if (v.title.trim().length < 3) e.title = "Minimum 3 characters";

    if (!v.description.trim()) e.description = "Description is required";
    else if (v.description.trim().length < 20) e.description = "Minimum 20 characters";
  }

  if (step === 2) {
    if (v.askingPrice && (isNaN(Number(v.askingPrice)) || Number(v.askingPrice) < 0))
      e.askingPrice = "Must be a positive number";

    if (v.sharePercentage) {
      const n = Number(v.sharePercentage);
      if (isNaN(n) || n < 0 || n > 100) e.sharePercentage = "Must be 0 – 100";
    }

    if (v.annualRevenue && (isNaN(Number(v.annualRevenue)) || Number(v.annualRevenue) < 0))
      e.annualRevenue = "Must be a positive number";

    if (v.netProfit && isNaN(Number(v.netProfit))) e.netProfit = "Must be a valid number";
  }

  if (step === 3) {
    if (v.employeeCount) {
      const n = Number(v.employeeCount);
      if (!Number.isInteger(n) || n < 0) e.employeeCount = "Must be a whole number ≥ 0";
    }
    if (v.yearEstablished) {
      const n = Number(v.yearEstablished);
      const now = new Date().getFullYear();
      if (!Number.isInteger(n) || n < 1800 || n > now)
        e.yearEstablished = `Must be between 1800 and ${now}`;
    }
  }

  return e;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <Fragment key={label}>
              <div
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "ring-2 ring-primary text-primary bg-background",
                  !done && !active && "ring-1 ring-muted text-muted-foreground bg-background"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-px flex-1 transition-colors", done ? "bg-primary" : "bg-muted")} />
              )}
            </Fragment>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        Step {current} of {STEPS.length} — {STEPS[current - 1]}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ListingFormDialogProps {
  trigger: React.ReactNode;
  listing?: DashboardListing;
}

export function ListingFormDialog({ trigger, listing }: ListingFormDialogProps) {
  const router = useRouter();
  const isEdit = !!listing;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>(listing ? toForm(listing) : EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(key: keyof FormValues) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function advance() {
    const stepErrors = validate(step, values);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  async function submit() {
    // Re-validate all steps on final submit
    const allErrors = Object.assign(
      {},
      validate(1, values),
      validate(2, values),
      validate(3, values)
    );
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      return;
    }

    setSubmitting(true);
    setApiError("");

    const body = {
      title: values.title.trim(),
      description: values.description.trim(),
      industry: values.industry || null,
      province: values.province || null,
      location: values.location.trim() || null,
      ...(isEdit && { status: values.status }),
      askingPrice: values.askingPrice ? Number(values.askingPrice) : null,
      sharePercentage: values.sharePercentage ? Number(values.sharePercentage) : null,
      annualRevenue: values.annualRevenue ? Number(values.annualRevenue) : null,
      netProfit: values.netProfit ? Number(values.netProfit) : null,
      employeeCount: values.employeeCount ? parseInt(values.employeeCount) : null,
      yearEstablished: values.yearEstablished ? parseInt(values.yearEstablished) : null,
      operatingHours: values.operatingHours.trim() || null,
      reasonForSelling: values.reasonForSelling.trim() || null,
    };

    try {
      const res = await fetch(isEdit ? `/api/listings/${listing.id}` : "/api/listings", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setApiError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setApiError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) {
      setStep(1);
      setValues(listing ? toForm(listing) : EMPTY);
      setErrors({});
      setApiError("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit listing" : "New listing"}</DialogTitle>
        </DialogHeader>

        <StepIndicator current={step} />

        <div className="space-y-4 py-1">
          {/* ── Step 1 : Basic Info ── */}
          {step === 1 && (
            <>
              <Field label="Title" required error={errors.title}>
                <Input
                  placeholder="e.g. Profitable café in Cape Town CBD"
                  value={values.title}
                  onChange={handleChange("title")}
                />
              </Field>

              <Field label="Description" required error={errors.description}>
                <Textarea
                  placeholder="Describe the business, its history, and what makes it valuable…"
                  rows={4}
                  value={values.description}
                  onChange={handleChange("description")}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Industry" error={errors.industry}>
                  <select
                    className={SELECT_CLASS}
                    value={values.industry}
                    onChange={handleChange("industry")}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Province" error={errors.province}>
                  <select
                    className={SELECT_CLASS}
                    value={values.province}
                    onChange={handleChange("province")}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Location" error={errors.location}>
                  <Input
                    placeholder="e.g. Cape Town CBD"
                    value={values.location}
                    onChange={handleChange("location")}
                  />
                </Field>

                {isEdit && (
                  <Field label="Status" error={errors.status}>
                    <select
                      className={SELECT_CLASS}
                      value={values.status}
                      onChange={handleChange("status")}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Closed / Paused</option>
                      <option value="SOLD">Sold</option>
                    </select>
                  </Field>
                )}
              </div>
            </>
          )}

          {/* ── Step 2 : Finance ── */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Asking price (R)" error={errors.askingPrice}>
                  <Input
                    type="number"
                    min={0}
                    placeholder="5 000 000"
                    value={values.askingPrice}
                    onChange={handleChange("askingPrice")}
                  />
                </Field>

                <Field label="Share for sale (%)" error={errors.sharePercentage}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    placeholder="51"
                    value={values.sharePercentage}
                    onChange={handleChange("sharePercentage")}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Annual revenue (R)" error={errors.annualRevenue}>
                  <Input
                    type="number"
                    min={0}
                    placeholder="2 000 000"
                    value={values.annualRevenue}
                    onChange={handleChange("annualRevenue")}
                  />
                </Field>

                <Field label="Net profit p.a. (R)" error={errors.netProfit}>
                  <Input
                    type="number"
                    placeholder="500 000"
                    value={values.netProfit}
                    onChange={handleChange("netProfit")}
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── Step 3 : Operations ── */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Employees" error={errors.employeeCount}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="12"
                    value={values.employeeCount}
                    onChange={handleChange("employeeCount")}
                  />
                </Field>

                <Field label="Year established" error={errors.yearEstablished}>
                  <Input
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    placeholder="2010"
                    value={values.yearEstablished}
                    onChange={handleChange("yearEstablished")}
                  />
                </Field>
              </div>

              <Field label="Operating hours" error={errors.operatingHours}>
                <Input
                  placeholder="Mon–Fri 08:00–17:00, Sat 09:00–13:00"
                  value={values.operatingHours}
                  onChange={handleChange("operatingHours")}
                />
              </Field>
            </>
          )}

          {/* ── Step 4 : Reason for Selling ── */}
          {step === 4 && (
            <Field label="Reason for selling" error={errors.reasonForSelling}>
              <Textarea
                placeholder="Explain why you are selling the business…"
                rows={6}
                value={values.reasonForSelling}
                onChange={handleChange("reasonForSelling")}
              />
            </Field>
          )}

          {apiError && (
            <Alert variant="destructive">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            disabled={submitting}
            onClick={step === 1 ? () => setOpen(false) : back}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </Button>

          {step < STEPS.length ? (
            <Button onClick={advance}>Next →</Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
