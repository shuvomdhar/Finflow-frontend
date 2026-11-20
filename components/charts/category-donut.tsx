"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { expenseCategoryMeta, incomeCategoryMeta } from "@/lib/constants";
import { useCurrency } from "@/lib/currency";
import type { CategoryTotal } from "@/lib/types";
import { ChartTooltip } from "./chart-tooltip";

export function CategoryDonut({
  categories,
  total,
  kind = "expense",
  centerLabel,
  maxRows = 5,
}: {
  categories: CategoryTotal[];
  total: number;
  kind?: "expense" | "income";
  centerLabel?: string;
  maxRows?: number;
}) {
  const { formatCompactCurrency, formatCurrency } = useCurrency();
  const lookup = kind === "income" ? incomeCategoryMeta : expenseCategoryMeta;

  const data = categories.map((category) => {
    const meta = lookup(category.category);
    return {
      name: meta.label,
      value: category.total,
      color: meta.color,
    };
  });

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center text-center">
        <p className="text-[13px] font-medium text-slate-500">
          No {kind === "income" ? "income" : "spending"} recorded yet
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Add a record to see the category split.
        </p>
      </div>
    );
  }

  const top = data.slice(0, maxRows);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-[176px] w-[176px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="var(--color-surface)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {centerLabel ?? (kind === "income" ? "Inflow" : "Outflow")}
          </span>
          <span className="mt-0.5 font-display text-[15px] font-extrabold text-navy">
            {formatCompactCurrency(total)}
          </span>
          <span className="text-[9px] text-slate-400">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        {top.map((entry) => {
          const percentage =
            total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div key={entry.name}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-slate-600">
                  {entry.name}
                </span>
                <span className="text-[11px] font-bold text-navy">
                  {percentage}%
                </span>
              </div>
              <div className="ml-4 mt-1 h-1 overflow-hidden rounded-full bg-lav">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(percentage, 2)}%`,
                    backgroundColor: entry.color,
                  }}
                />
              </div>
            </div>
          );
        })}
        {data.length > top.length ? (
          <p className="text-[10px] text-muted">
            +{data.length - top.length} more categories
          </p>
        ) : null}
      </div>
    </div>
  );
}
