"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BRAND } from "@/lib/constants";
import type { MonthPoint } from "@/lib/types";
import { ChartTooltip } from "./chart-tooltip";

/**
 * Full-year expense bars. The selected month is pulled forward in navy while
 * the rest of the year recedes, mirroring the annual ledger view.
 */
export function AnnualBars({
  months,
  activeMonth,
  height = 230,
}: {
  months: MonthPoint[];
  activeMonth: number | null;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={months}
        margin={{ top: 12, right: 4, left: 0, bottom: 0 }}
        barCategoryGap="26%"
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted)", fontSize: 10 }}
          dy={6}
        />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
          content={<ChartTooltip />}
        />
        <Bar dataKey="expense" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={26}>
          {months.map((entry) => (
            <Cell
              key={entry.month}
              fill={
                activeMonth === entry.month
                  ? "var(--color-focus)"
                  : `${BRAND.indigo}4d`
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthBars({
  months,
  activeMonth,
  height = 230,
}: {
  months: MonthPoint[];
  activeMonth: number | null;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={months}
        margin={{ top: 12, right: 4, left: 0, bottom: 0 }}
        barCategoryGap="26%"
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted)", fontSize: 10 }}
          dy={6}
        />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
          content={<ChartTooltip />}
        />
        <Bar dataKey="income" name="Income" fill={`${BRAND.emerald}4d`} radius={[4, 4, 0, 0]} maxBarSize={16} />
        <Bar dataKey="expense" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={16}>
          {months.map((entry) => (
            <Cell
              key={entry.month}
              fill={
                activeMonth === entry.month
                  ? "var(--color-focus)"
                  : BRAND.indigo
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
