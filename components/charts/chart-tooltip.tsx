"use client";

import { useCurrency } from "@/lib/currency";

export type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  const { formatCurrency } = useCurrency();

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5 text-xs shadow-float">
      <p className="mb-1.5 font-semibold text-navy">{label}</p>
      {payload.map((entry) => (
        <div
          key={`${entry.name}-${entry.value}`}
          className="flex items-center justify-between gap-5 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: entry.color ?? "#059669" }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-navy">
            {formatCurrency(Number(entry.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}
