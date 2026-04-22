export function formatMoney(value: number | string | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatPercentage(value: number | string | null | undefined): string {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en").format(value);
}
