type Numeric = number | string | { toString(): string } | null | undefined;

export function formatMoney(value: Numeric): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(String(value)));
}

export function formatPercentage(value: Numeric): string {
  if (value == null) return "—";
  return `${Number(String(value)).toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en").format(value);
}
