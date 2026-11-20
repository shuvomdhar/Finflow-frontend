"use client";

import {
  ArrowRight,
  BadgeDollarSign,
  CalendarRange,
  ChartSpline,
  Download,
  Loader2,
  PiggyBank,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnnualBars, MonthBars } from "@/components/charts/annual-bars";
import { CategoryDonut } from "@/components/charts/category-donut";
import { DailyOutflow } from "@/components/charts/daily-outflow";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, downloadReportPdf } from "@/lib/api";
import { expenseCategoryMeta } from "@/lib/constants";
import {
  currentMonth,
  formatDate,
  formatMonth,
  yearOptions,
} from "@/lib/format";
import type { Report } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";

type Mode = "year" | "month";

function monthChoices(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return { value: month, label: formatMonth(month) };
  });
}

export function ReportsClient() {
  const { formatCurrency, currency } = useCurrency();
  const today = currentMonth();
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [mode, setMode] = useState<Mode>("year");
  const [month, setMonth] = useState(today);
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const activeMonth = mode === "month" ? month : null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (activeMonth) params.set("month", activeMonth);
      const report = await apiFetch<Report>(
        `/api/reports?${params.toString()}`,
      );
      setData(report);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your report.",
      );
    } finally {
      setLoading(false);
    }
  }, [year, activeMonth]);

  useEffect(() => {
    // Load asynchronously so the effect never triggers a synchronous
    // set-state cascade during the commit phase.
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function download() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadReportPdf(year, activeMonth, currency);
    } catch (downloadFailure) {
      setDownloadError(
        downloadFailure instanceof Error
          ? downloadFailure.message
          : "Could not generate the PDF.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const periodLabel = activeMonth ? formatMonth(activeMonth) : `All of ${year}`;

  const projection = useMemo(() => {
    if (!data) return 0;
    if (data.month) {
      const [y, m] = data.month.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      return data.insights.averagePerActiveDay * daysInMonth;
    }
    const activeMonths = data.months.filter((point) => point.expense > 0).length;
    if (activeMonths === 0) return 0;
    return (data.yearTotals.expense / activeMonths) * 12;
  }, [data]);

  const largestCategory = data?.categories[0];

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        breadcrumb={["Core ledger", "Analytics & Trends"]}
        title="Spending Analytics & Trends"
        description="Move between a full-year view and a single month. See the annual rhythm, the category split, and the daily outflow behind every number."
      />

      <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-card sm:flex-row sm:flex-wrap sm:items-center">
        <span className="eyebrow mr-1">View</span>
        <div className="flex rounded-lg bg-lav p-0.5">
          {(
            [
              { value: "year", label: "Year-wise" },
              { value: "month", label: "Month-wise" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11.5px] font-semibold transition",
                mode === option.value
                  ? "bg-forest text-white shadow-sm"
                  : "text-slate-500 hover:text-navy",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Select
          aria-label="Select year"
          value={year}
          onChange={(event) => {
            const nextYear = Number(event.target.value);
            setYear(nextYear);
            setMonth(`${nextYear}-${today.slice(5, 7)}`);
          }}
          className="h-9 w-[112px]"
        >
          {yearOptions(7).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Select month"
          value={month}
          disabled={mode === "year"}
          onChange={(event) => setMonth(event.target.value)}
          className="h-9 w-[188px] disabled:opacity-50"
        >
          {monthChoices(year).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="sm:ml-auto">
          <Button onClick={() => void download()} loading={downloading}>
            {downloading ? (
              "Preparing…"
            ) : (
              <>
                <Download className="h-4 w-4" />
                PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {downloadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-700">
          {downloadError}
        </div>
      ) : null}

      {loading && !data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </div>
          <Card className="p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-6 h-[240px] w-full" />
          </Card>
        </>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-base font-bold text-navy">
            We could not load this report
          </p>
          <p className="mt-1.5 max-w-md text-sm text-muted">{error}</p>
          <button
            onClick={() => void load()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Income"
              value={formatCurrency(data.totals.income)}
              icon={Wallet}
              tone="emerald"
              badge={<Chip tone="green">{data.year}</Chip>}
              helper={periodLabel}
            />
            <MetricCard
              label="Expenses"
              value={formatCurrency(data.totals.expense)}
              icon={ReceiptText}
              tone="indigo"
              helper={`${data.insights.activeDays} active spending days`}
            />
            <MetricCard
              label="Net balance"
              value={formatCurrency(data.totals.balance)}
              icon={BadgeDollarSign}
              tone="sky"
              badge={
                <Chip tone={data.totals.balance >= 0 ? "green" : "rose"}>
                  {data.totals.balance >= 0 ? "Surplus" : "Deficit"}
                </Chip>
              }
              helper="Income minus expenses"
            />
            <MetricCard
              label="Savings rate"
              value={`${data.totals.savingsRate}%`}
              icon={PiggyBank}
              tone="neutral"
              helper={
                largestCategory
                  ? `Top category: ${expenseCategoryMeta(largestCategory.category).label}`
                  : "No spending in this period"
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.62fr_1fr]">
            <Card>
              <CardHeader
                title="Annual outflow rhythm"
                subtitle={`Monthly expenses through ${data.year}`}
                action={
                  <span className="hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 sm:flex">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm bg-indigo-brand/40" />
                      Month
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm bg-focus" />
                      Focus
                    </span>
                  </span>
                }
              />
              <div className="px-3 pb-2 pt-3">
                <AnnualBars
                  months={data.months}
                  activeMonth={
                    data.month ? Number(data.month.slice(5, 7)) : null
                  }
                  height={228}
                />
              </div>
              <div className="border-t border-line px-5 py-3">
                <p className="text-[10.5px] text-slate-400">
                  Year-to-date outflow:{" "}
                  <span className="font-semibold text-navy">
                    {formatCurrency(data.yearTotals.expense)}
                  </span>{" "}
                  across {data.yearTotals.expenseCount} transactions.
                </p>
              </div>
            </Card>

            <div className="overflow-hidden rounded-2xl bg-navy p-5 text-white shadow-card ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                    Focus period
                  </p>
                  <p className="mt-1 font-display text-[17px] font-extrabold">
                    {periodLabel}
                  </p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-emerald-300">
                  <Target className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] text-slate-400">Net retained</span>
                  <span className="text-[13px] font-bold text-white">
                    {formatCurrency(data.totals.balance)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] text-slate-400">
                    Largest expense
                  </span>
                  <span className="max-w-[150px] truncate text-right text-[12px] font-semibold text-white">
                    {data.insights.largestExpense
                      ? `${data.insights.largestExpense.title} · ${formatCurrency(
                          data.insights.largestExpense.amount,
                        )}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] text-slate-400">
                    Top merchant
                  </span>
                  <span className="max-w-[150px] truncate text-right text-[12px] font-semibold text-white">
                    {data.insights.topMerchant
                      ? `${data.insights.topMerchant.title} (${data.insights.topMerchant.count}×)`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Weekend average
                  </span>
                  <span className="text-[12px] font-semibold text-white">
                    {formatCurrency(data.insights.weekendAverage)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5">
                <span className="text-[10.5px] text-slate-300">
                  Savings rate
                </span>
                <span className="text-[13px] font-bold text-emerald-300">
                  {data.totals.savingsRate}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_1.62fr]">
            <Card>
              <CardHeader
                title="Category allocation"
                subtitle={`Share of outflow · ${periodLabel}`}
              />
              <div className="p-5">
                <CategoryDonut
                  categories={data.categories}
                  total={data.totals.expense}
                  centerLabel="Outflow"
                  maxRows={5}
                />
              </div>
            </Card>

            <Card>
              <CardHeader
                title={data.month ? "Daily outflow curve" : "Monthly comparison"}
                subtitle={
                  data.month
                    ? `${formatMonth(data.month)} · weekly bands`
                    : `Income and expenses across ${data.year}`
                }
              />
              <div className="px-3 pb-2 pt-3">
                {data.month ? (
                  <DailyOutflow days={data.days} height={248} />
                ) : (
                  <MonthBars
                    months={data.months}
                    activeMonth={null}
                    height={248}
                  />
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Ledger signals"
              subtitle={`What the numbers say about ${periodLabel}`}
              action={
                <span className="inline-flex items-center gap-1.5 rounded-md bg-lav px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  <Sparkles className="h-3 w-3" />
                  Auto insight
                </span>
              }
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="eyebrow">Avg per active day</p>
                <p className="mt-1.5 font-display text-xl font-extrabold text-navy">
                  {formatCurrency(data.insights.averagePerActiveDay)}
                </p>
                <p className="mt-1 text-[10.5px] text-muted">
                  Over {data.insights.activeDays} spending days
                </p>
              </div>
              <div>
                <p className="eyebrow">Weekday average</p>
                <p className="mt-1.5 font-display text-xl font-extrabold text-navy">
                  {formatCurrency(data.insights.weekdayAverage)}
                </p>
                <p className="mt-1 text-[10.5px] text-muted">
                  Monday to Friday outflow
                </p>
              </div>
              <div>
                <p className="eyebrow">Weekend average</p>
                <p className="mt-1.5 font-display text-xl font-extrabold text-navy">
                  {formatCurrency(data.insights.weekendAverage)}
                </p>
                <p className="mt-1 text-[10.5px] text-muted">
                  Saturday and Sunday outflow
                </p>
              </div>
              <div>
                <p className="eyebrow">Largest single expense</p>
                <p className="mt-1.5 truncate font-display text-xl font-extrabold text-navy">
                  {data.insights.largestExpense
                    ? formatCurrency(data.insights.largestExpense.amount)
                    : "—"}
                </p>
                <p className="mt-1 truncate text-[10.5px] text-muted">
                  {data.insights.largestExpense
                    ? `${data.insights.largestExpense.title} · ${formatDate(
                        data.insights.largestExpense.date,
                      )}`
                    : "No expenses in this period"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line bg-lav/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-[11px] text-slate-500">
                <ChartSpline className="h-4 w-4 text-forest" />
                Projected outflow at this pace:{" "}
                <span className="font-bold text-navy">
                  {formatCurrency(projection)}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void download()}
                  disabled={downloading}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[11px] font-semibold text-navy transition hover:bg-lav disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download statement
                </button>
                <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-400">
                  <CalendarRange className="h-3.5 w-3.5" />
                  {data.yearTotals.incomeCount} in ·{" "}
                  {data.yearTotals.expenseCount} out in {data.year}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
