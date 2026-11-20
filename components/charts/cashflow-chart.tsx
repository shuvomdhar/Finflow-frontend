"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BRAND } from "@/lib/constants";
import { useCurrency } from "@/lib/currency";
import type { MonthPoint } from "@/lib/types";
import { ChartTooltip } from "./chart-tooltip";

export function CashflowChart({
  data,
  height = 250,
}: {
  data: MonthPoint[];
  height?: number;
}) {
  const { formatCompactCurrency } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        barGap={3}
        margin={{ top: 8, right: 4, left: -14, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 6"
          vertical={false}
          stroke="var(--color-line)"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted)", fontSize: 10 }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted)", fontSize: 10 }}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
          width={58}
        />
        <Tooltip
          cursor={{ fill: "rgba(15, 23, 42, 0.035)" }}
          content={<ChartTooltip />}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill={BRAND.emerald}
          radius={[4, 4, 0, 0]}
          maxBarSize={16}
        />
        <Bar
          dataKey="expense"
          name="Expenses"
          fill={BRAND.indigo}
          radius={[4, 4, 0, 0]}
          maxBarSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
