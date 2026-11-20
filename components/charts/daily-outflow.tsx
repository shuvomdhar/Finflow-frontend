"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BRAND } from "@/lib/constants";
import { useCurrency } from "@/lib/currency";
import { ChartTooltip } from "./chart-tooltip";

type DayPoint = { day: number; label: string; total: number };

/**
 * Daily outflow curve. Alternating week bands make it easy to compare spending
 * intensity across the month.
 */
export function DailyOutflow({
  days,
  height = 260,
}: {
  days: DayPoint[];
  height?: number;
}) {
  const { formatCompactCurrency } = useCurrency();
  const bands = Math.ceil(days.length / 7);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={days} margin={{ top: 10, right: 6, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.emerald} stopOpacity={0.26} />
            <stop offset="100%" stopColor={BRAND.emerald} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {Array.from({ length: bands }).map((_, index) =>
          index % 2 === 0 ? (
            <ReferenceArea
              key={index}
              x1={days[index * 7]?.label}
              x2={days[Math.min(index * 7 + 6, days.length - 1)]?.label}
              fill="var(--color-lav)"
              ifOverflow="extendDomain"
            />
          ) : null,
        )}

        <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--color-line)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted)", fontSize: 10 }}
          interval={4}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted)", fontSize: 10 }}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          name="Daily outflow"
          stroke={BRAND.emerald}
          strokeWidth={2}
          fill="url(#outflowFill)"
          dot={false}
          activeDot={{ r: 4, fill: BRAND.emerald }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
