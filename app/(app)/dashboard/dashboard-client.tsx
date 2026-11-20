"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  ReceiptText,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { CategoryBadge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldError, Input, Select } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  expenseCategoryMeta,
  incomeCategoryMeta,
} from "@/lib/constants";
import {
  currentMonth,
  formatDate,
  formatMonth,
  formatMonthShort,
  monthOptions,
  todayIso,
} from "@/lib/format";
import type { Expense, Income, Overview } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";

type Tab = "all" | "expenses" | "income";

type LedgerRow =
  | { kind: "expense"; id: string; title: string; category: string; date: string; amount: number }
  | { kind: "income"; id: string; title: string; category: string; date: string; amount: number };

function buildRows(expenses: Expense[], incomes: Income[]): LedgerRow[] {
  const expenseRows: LedgerRow[] = expenses.map((expense) => ({
    kind: "expense",
    id: `expense-${expense.id}`,
    title: expense.title,
    category: expense.category,
    date: expense.spentOn,
    amount: expense.amount,
  }));

  const incomeRows: LedgerRow[] = incomes.map((income) => ({
    kind: "income",
    id: `income-${income.id}`,
    title: income.source,
    category: income.category,
    date: `${income.month}-01`,
    amount: income.amount,
  }));

  return [...expenseRows, ...incomeRows].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

export function DashboardClient({ firstName }: { firstName: string }) {
  const { formatCurrency, toUsd, currency } = useCurrency();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  const [qeType, setQeType] = useState<"expense" | "income">("expense");
  const [qeTitle, setQeTitle] = useState("");
  const [qeAmount, setQeAmount] = useState("");
  const [qeCategory, setQeCategory] = useState("food");
  const [qeNote, setQeNote] = useState("");
  const [qeSaving, setQeSaving] = useState(false);
  const [qeError, setQeError] = useState<string | null>(null);
  const [qeSuccess, setQeSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await apiFetch<Overview>(
        `/api/overview?month=${encodeURIComponent(month)}`,
      );
      setData(overview);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your overview.",
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    // Load asynchronously so the effect never triggers a synchronous
    // set-state cascade during the commit phase.
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const rows = useMemo(
    () => buildRows(data?.recentExpenses ?? [], data?.recentIncomes ?? []),
    [data],
  );

  const visibleRows = rows.filter((row) =>
    tab === "all" ? true : tab === "expenses" ? row.kind === "expense" : row.kind === "income",
  );

  const salaryTotal =    data?.incomeCategories.find((category) => category.category === "salary")
      ?.total ?? 0;
  const extraTotal = Math.max((data?.income ?? 0) - salaryTotal, 0);
  const variableCount = (data?.recentIncomes ?? []).filter(
    (income) => income.category !== "salary",
  ).length;

  const velocity =
    data && data.expense > 0 ? data.income / data.expense : 0;
  const revenuePower = Math.max(
    0,
    Math.min(100, data?.savingsRate ?? 0),
  );
  const burn = Math.max(0, Math.round(100 - revenuePower));
  const expenseRatio =
    data && data.income > 0
      ? Math.min(100, Math.round((data.expense / data.income) * 100))
      : 0;

  function switchQuickType(next: "expense" | "income") {
    setQeType(next);
    setQeCategory(
      next === "income" ? "salary" : "food",
    );
    setQeError(null);
    setQeSuccess(null);
  }

  async function submitQuick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = Number(qeAmount);

    if (!qeTitle.trim()) {
      setQeError("Add a merchant or source name.");
      return;
    }
    if (!Number.isFinite(entered) || entered <= 0) {
      setQeError("Enter an amount greater than zero.");
      return;
    }

    const amount = toUsd(entered);

    if (amount <= 0) {
      setQeError("This amount is too small to record.");
      return;
    }

    setQeSaving(true);
    setQeError(null);
    setQeSuccess(null);

    try {
      if (qeType === "income") {
        await apiFetch("/api/incomes", {
          method: "POST",
          body: JSON.stringify({
            month,
            source: qeTitle.trim(),
            category: qeCategory,
            amount,
            note: qeNote.trim() || null,
          }),
        });
      } else {
        const spentOn =
          month === currentMonth() ? todayIso() : `${month}-01`;
        await apiFetch("/api/expenses", {
          method: "POST",
          body: JSON.stringify({
            spentOn,
            title: qeTitle.trim(),
            category: qeCategory,
            amount,
            paymentMethod: "card",
            note: qeNote.trim() || null,
          }),
        });
      }

      setQeTitle("");
      setQeAmount("");
      setQeNote("");
      setQeSuccess(
        `${qeType === "income" ? "Income" : "Expense"} recorded in the ledger.`,
      );
      await load();
    } catch (submitError) {
      setQeError(
        submitError instanceof Error
          ? submitError.message
          : "Could not record this entry.",
      );
    } finally {
      setQeSaving(false);
    }
  }

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        breadcrumb={["Core ledger", "Dashboard"]}
        title="Executive Ledger Summary"
        description={`Welcome back, ${firstName}. Here is exactly how your money moved through ${formatMonth(month)}.`}
        actions={
          <>
            <Select
              aria-label="Select month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="h-10 w-[164px]"
            >
              {monthOptions().map((option) => (
                <option key={option} value={option}>
                  {formatMonth(option)}
                </option>
              ))}
            </Select>
            <LinkButton href="/income?new=1" variant="outline" size="md">
              <Plus className="h-4 w-4" />
              Add income
            </LinkButton>
            <LinkButton href="/expenses?new=1" size="md">
              <Minus className="h-4 w-4" />
              Add expense
            </LinkButton>
          </>
        }
      />

      {loading && !data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card className="p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-6 h-[240px] w-full" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mx-auto mt-8 h-[170px] w-[170px] rounded-full" />
            </Card>
          </div>
        </>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-base font-bold text-navy">
            We could not load your overview
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
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Total monthly income"
              value={formatCurrency(data.income)}
              icon={Wallet}
              tone="emerald"
              badge={<Chip tone="green">Inflow</Chip>}
              helper={
                <>
                  Across {data.incomeCount}{" "}
                  {data.incomeCount === 1 ? "source" : "sources"} ·{" "}
                  {formatMonthShort(data.month)}
                </>
              }
            >
              <div className="space-y-2 border-t border-line pt-3">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                    Primary salary
                  </span>
                  <span className="font-bold text-navy">
                    {formatCurrency(salaryTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-brand" />
                    Extra income
                  </span>
                  <span className="font-bold text-navy">
                    +{formatCurrency(extraTotal)}
                  </span>
                </div>
              </div>
            </MetricCard>
            <MetricCard
              label="Total monthly expenses"
              value={formatCurrency(data.expense)}
              icon={ReceiptText}
              tone="indigo"
              badge={<Chip tone="indigo">{expenseRatio}% of inflow</Chip>}
              helper={
                <>
                  {data.expenseCount}{" "}
                  {data.expenseCount === 1 ? "transaction" : "transactions"}{" "}
                  logged this month
                </>
              }
            >
              <div className="border-t border-line pt-3">
                <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>Surplus reserve buffer</span>
                  <span className="font-bold text-forest">
                    {formatCurrency(data.balance)} saved
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-lav">
                  <div
                    className="h-full rounded-full bg-indigo-brand"
                    style={{ width: `${Math.max(expenseRatio, 2)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {data.balance >= 0
                    ? `Spending sits ${100 - expenseRatio}% below inflow.`
                    : "Outflow currently exceeds inflow this month."}
                </p>
              </div>
            </MetricCard>
            <MetricCard
              label="Net savings rate"
              value={`${data.savingsRate}%`}
              icon={ArrowUpRight}
              tone="sky"
              badge={
                <Chip tone={data.balance >= 0 ? "green" : "rose"}>
                  {data.balance >= 0 ? "On track" : "Watch"}
                </Chip>
              }
              helper={`${formatCurrency(data.balance)} retained this month`}
            >
              <div className="border-t border-line pt-3">
                <div className="flex gap-1">
                  <span
                    className="h-1.5 rounded-full bg-forest"
                    style={{ width: `${revenuePower}%` }}
                  />
                  <span
                    className="h-1.5 rounded-full bg-indigo-brand"
                    style={{ width: `${burn}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Revenue power {revenuePower}%</span>
                  <span>Burn {burn}%</span>
                </div>
              </div>
            </MetricCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.62fr_1fr]">
            <Card>
              <CardHeader
                title="Twelve-month cash flow"
                subtitle={`Income against expenses for ${data.year}`}
                action={
                  <div className="hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 sm:flex">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm bg-emerald-brand" />
                      Income
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm bg-indigo-brand" />
                      Expenses
                    </span>
                  </div>
                }
              />
              <div className="px-3 pb-3 pt-4">
                <CashflowChart data={data.series} height={244} />
              </div>
              <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
                <div className="px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Inflow
                  </p>
                  <p className="mt-1 text-[12.5px] font-bold text-emerald-brand">
                    +{formatCurrency(data.income)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Outflow
                  </p>
                  <p className="mt-1 text-[12.5px] font-bold text-navy">
                    −{formatCurrency(data.expense)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Cash velocity
                  </p>
                  <p className="mt-1 flex items-baseline gap-1 text-[12.5px] font-bold text-navy">
                    {velocity > 0 ? `${velocity.toFixed(2)}×` : "—"}
                    <span className="text-[9.5px] font-medium text-slate-400">
                      cover
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Spending mix"
                subtitle={`Category allocation · ${formatMonthShort(data.month)}`}
              />
              <div className="p-5">
                <CategoryDonut
                  categories={data.expenseCategories}
                  total={data.expense}
                  centerLabel="Spent"
                />
              </div>
            </Card>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[1.62fr_1fr]">
            <Card>
              <CardHeader
                title="Recent transactions"
                subtitle="Newest activity in this month"
                action={
                  <div className="flex rounded-lg bg-lav p-0.5">
                    {(
                      [
                        { value: "all", label: "All" },
                        { value: "expenses", label: "Expenses" },
                        { value: "income", label: "Income" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTab(option.value)}
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition",
                          tab === option.value
                            ? "seg-active"
                            : "text-slate-500 hover:text-navy",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                }
              />

              {visibleRows.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-[13px] font-semibold text-navy">
                    Nothing logged yet
                  </p>
                  <p className="mt-1 text-[11.5px] text-muted">
                    Add an income source or an expense to fill this ledger.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <LinkButton href="/income?new=1" size="sm" variant="outline">
                      Add income
                    </LinkButton>
                    <LinkButton href="/expenses?new=1" size="sm">
                      Add expense
                    </LinkButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left">
                      <thead>
                        <tr className="border-b border-line bg-lav/40 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          <th className="px-5 py-2.5">Date</th>
                          <th className="px-5 py-2.5">Description</th>
                          <th className="px-5 py-2.5">Category</th>
                          <th className="px-5 py-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {visibleRows.slice(0, 7).map((row) => {
                          const meta =
                            row.kind === "income"
                              ? incomeCategoryMeta(row.category)
                              : expenseCategoryMeta(row.category);
                          return (
                            <tr key={row.id} className="hover:bg-lav/30">
                              <td className="whitespace-nowrap px-5 py-3 text-[11px] font-medium text-slate-500">
                                {formatDate(row.date)}
                              </td>
                              <td className="px-5 py-3">
                                <span className="flex items-center gap-2 text-[12.5px] font-semibold text-navy">
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      row.kind === "income"
                                        ? "bg-emerald-brand"
                                        : "bg-indigo-brand",
                                    )}
                                  />
                                  {row.title}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <CategoryBadge
                                  label={meta.label}
                                  color={meta.color}
                                />
                              </td>
                              <td
                                className={cn(
                                  "whitespace-nowrap px-5 py-3 text-right text-[12.5px] font-bold",
                                  row.kind === "income"
                                    ? "text-emerald-brand"
                                    : "text-navy",
                                )}
                              >
                                {row.kind === "income" ? "+" : "−"}
                                {formatCurrency(row.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-line px-5 py-3">
                    <span className="text-[10.5px] text-slate-400">
                      Showing {Math.min(visibleRows.length, 7)} of{" "}
                      {visibleRows.length} records
                    </span>
                    <Link
                      href={tab === "income" ? "/income" : "/expenses"}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:underline"
                    >
                      Open full ledger
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </>
              )}
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader
                  title="Quick entry"
                  subtitle="Log money in or out in a moment"
                />
                <div className="p-4">
                  <div className="flex rounded-lg bg-lav p-0.5">
                    {(
                      [
                        { value: "expense", label: "Expense" },
                        { value: "income", label: "Income" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => switchQuickType(option.value)}
                        aria-label={`Quick entry type: ${option.value}`}
                        className={cn(
                          "flex-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition",
                          qeType === option.value
                            ? "seg-active"
                            : "text-slate-500 hover:text-navy",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={submitQuick} className="mt-3 space-y-2.5">
                    <Input
                      value={qeTitle}
                      onChange={(event) => setQeTitle(event.target.value)}
                      placeholder={
                        qeType === "expense"
                          ? "Merchant or description"
                          : "Income source"
                      }
                      aria-label="Quick entry description"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={qeAmount}
                        onChange={(event) => setQeAmount(event.target.value)}
                        placeholder={`Amount (${currency})`}
                        aria-label="Quick entry amount"
                        required
                      />
                      <Select
                        value={qeCategory}
                        onChange={(event) => setQeCategory(event.target.value)}
                        aria-label="Quick entry category"
                      >
                        {(qeType === "expense"
                          ? EXPENSE_CATEGORIES
                          : INCOME_CATEGORIES
                        ).map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Input
                      value={qeNote}
                      onChange={(event) => setQeNote(event.target.value)}
                      placeholder="Note (optional)"
                      aria-label="Quick entry note"
                    />

                    <FieldError>{qeError}</FieldError>
                    {qeSuccess ? (
                      <p className="flex items-center gap-1.5 rounded-lg bg-mint px-3 py-2 text-[11px] font-semibold text-forest">
                        <Check className="h-3.5 w-3.5" />
                        {qeSuccess}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      className="w-full"
                      loading={qeSaving}
                    >
                      {qeSaving ? null : <Plus className="h-4 w-4" />}
                      Record {qeType}
                    </Button>
                  </form>
                </div>
                <div className="mx-4 mb-4 rounded-xl bg-navy px-3.5 py-3 text-white ring-1 ring-white/10">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    Month pulse
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    {data.expense === 0
                      ? "Add a few records and FinFlow will map where your money goes."
                      : data.savingsRate >= 20
                        ? `You retained ${data.savingsRate}% of this month's income. That is a healthy buffer.`
                        : `You retained ${data.savingsRate}% of income. Trimming one category lifts this quickly.`}
                  </p>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Income stream summary"
                  subtitle={formatMonthShort(data.month)}
                  action={
                    <Link
                      href="/income"
                      className="text-[10.5px] font-semibold text-forest hover:underline"
                    >
                      Manage
                    </Link>
                  }
                />
                {data.recentIncomes.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[12px] font-medium text-slate-500">
                      No income logged for this month.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.recentIncomes.slice(0, 5).map((income) => {
                      const meta = incomeCategoryMeta(income.category);
                      const share =
                        data.income > 0
                          ? Math.round((income.amount / data.income) * 100)
                          : 0;
                      return (
                        <li key={income.id} className="px-5 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-[12px] font-semibold text-navy">
                              {income.source}
                            </span>
                            <span className="text-[12px] font-bold text-emerald-brand">
                              +{formatCurrency(income.amount)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-lav">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(share, 2)}%`,
                                  backgroundColor: meta.color,
                                }}
                              />
                            </div>
                            <span className="text-[9.5px] font-semibold text-slate-400">
                              {share}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="flex items-center justify-between border-t border-line bg-lav/30 px-5 py-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Annual run-rate
                    </p>
                    <p className="text-[12.5px] font-bold text-navy">
                      {formatCurrency(data.income * 12)}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {variableCount} extra{" "}
                    {variableCount === 1 ? "stream" : "streams"}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
