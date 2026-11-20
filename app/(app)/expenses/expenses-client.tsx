"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Receipt,
  ReceiptText,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryBadge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/field";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  expenseCategoryMeta,
  paymentMethodLabel,
} from "@/lib/constants";
import {
  currentMonth,
  formatDate,
  formatMonth,
  monthOptions,
  todayIso,
} from "@/lib/format";
import type { Expense } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";

type ExpenseResponse = { expenses: Expense[]; total: number };
type SortKey = "date" | "amount" | "title";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

const emptyForm = () => ({
  spentOn: todayIso(),
  title: "",
  category: "food",
  amount: "",
  paymentMethod: "card",
  note: "",
});

function downloadCsv(
  rows: Expense[],
  month: string,
  currency: string,
  fromUsd: (value: number) => number,
) {
  const header = [
    "Date",
    "Description",
    "Category",
    "Payment method",
    "Note",
    `Amount (${currency})`,
  ];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((expense) =>
    [
      expense.spentOn,
      expense.title,
      expenseCategoryMeta(expense.category).label,
      paymentMethodLabel(expense.paymentMethod),
      expense.note ?? "",
      fromUsd(expense.amount).toFixed(2),
    ]
      .map((value) => escape(String(value)))
      .join(","),
  );
  const csv = [header.map(escape).join(","), ...lines].join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `finflow-expenses-${month}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ExpensesClient({
  initialNew,
  initialSearch,
}: {
  initialNew: boolean;
  initialSearch: string;
}) {
  const { formatCurrency, currency, toUsd, fromUsd } = useCurrency();
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState(initialSearch);
  const [data, setData] = useState<ExpenseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [payment, setPayment] = useState("");
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [quick, setQuick] = useState(emptyForm());
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickSaving, setQuickSaving] = useState(false);
  const quickRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ month });
      if (category) params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const result = await apiFetch<ExpenseResponse>(
        `/api/expenses?${params.toString()}`,
      );
      setData(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load expenses.",
      );
    } finally {
      setLoading(false);
    }
  }, [month, category, search]);

  useEffect(() => {
    // Load asynchronously so the effect never triggers a synchronous
    // set-state cascade during the commit phase.
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    // Reset pagination after the filters settle, one tick later.
    const timer = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(timer);
  }, [month, category, search, payment, sortKey, sortDir, pageSize]);

  useEffect(() => {
    if (!initialNew) return;
    quickRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialNew]);

  function openEdit(expense: Expense) {
    setEditing(expense);
    setForm({
      spentOn: expense.spentOn,
      title: expense.title,
      category: expense.category,
      amount: String(fromUsd(expense.amount)),
      paymentMethod: expense.paymentMethod,
      note: expense.note ?? "",
    });
    setFormError(null);
    setOpen(true);
  }

  async function addQuick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = Number(quick.amount);

    if (!quick.title.trim()) {
      setQuickError("Add a short description for this expense.");
      return;
    }
    if (!Number.isFinite(entered) || entered <= 0) {
      setQuickError("Enter an amount greater than zero.");
      return;
    }

    const amount = toUsd(entered);
    if (amount <= 0) {
      setQuickError("This amount is too small to record.");
      return;
    }

    setQuickSaving(true);
    setQuickError(null);

    try {
      await apiFetch<{ expense: Expense }>("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          spentOn: quick.spentOn,
          title: quick.title.trim(),
          category: quick.category,
          amount,
          paymentMethod: quick.paymentMethod,
          note: quick.note.trim() || null,
        }),
      });
      const newMonth = quick.spentOn.slice(0, 7);
      setQuick((current) => ({
        ...emptyForm(),
        spentOn: current.spentOn,
        category: current.category,
        paymentMethod: current.paymentMethod,
      }));
      if (newMonth !== month) setMonth(newMonth);
      else await load();
    } catch (submitError) {
      setQuickError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save this expense.",
      );
    } finally {
      setQuickSaving(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = Number(form.amount);

    if (!form.title.trim()) {
      setFormError("Add a short description for this expense.");
      return;
    }
    if (!Number.isFinite(entered) || entered <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    const amount = toUsd(entered);
    if (amount <= 0) {
      setFormError("This amount is too small to record.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await apiFetch<{ expense: Expense }>(
        editing ? `/api/expenses/${editing.id}` : "/api/expenses",
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({
            spentOn: form.spentOn,
            title: form.title.trim(),
            category: form.category,
            amount,
            paymentMethod: form.paymentMethod,
            note: form.note.trim() || null,
          }),
        },
      );
      setOpen(false);
      const newMonth = form.spentOn.slice(0, 7);
      if (newMonth !== month) setMonth(newMonth);
      else await load();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save this expense.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(expense: Expense) {
    if (!window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(expense.id);
    try {
      await apiFetch<{ ok: boolean }>(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });
      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this expense.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "title" ? "asc" : "desc");
    }
  }

  const expenses = useMemo(
    () =>
      (data?.expenses ?? []).filter(
        (expense) => !payment || expense.paymentMethod === payment,
      ),
    [data, payment],
  );

  const allExpenses = data?.expenses ?? [];

  const sorted = useMemo(() => {
    const rows = [...expenses];
    rows.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "amount") comparison = a.amount - b.amount;
      else if (sortKey === "title") comparison = a.title.localeCompare(b.title);
      else comparison = a.spentOn.localeCompare(b.spentOn);
      return sortDir === "asc" ? comparison : -comparison;
    });
    return rows;
  }, [expenses, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
      return totals;
    },
    {},
  );
  const topEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const average = expenses.length > 0 ? (data?.total ?? 0) / expenses.length : 0;
  const largest = expenses.reduce<Expense | null>(
    (best, expense) => (!best || expense.amount > best.amount ? expense : best),
    null,
  );

  const totalOutflow = data?.total ?? 0;
  const paymentTotals = allExpenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.paymentMethod] =
        (totals[expense.paymentMethod] ?? 0) + expense.amount;
      return totals;
    },
    {},
  );
  const paymentMix = PAYMENT_METHODS.map((method) => ({
    label: method.label,
    amount: paymentTotals[method.value] ?? 0,
    share:
      totalOutflow > 0
        ? Math.round(((paymentTotals[method.value] ?? 0) / totalOutflow) * 100)
        : 0,
  }))
    .filter((method) => method.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const [yearPart, monthPart] = month.split("-").map(Number);
  const daysInMonth = new Date(yearPart, monthPart, 0).getDate();
  const daysElapsed =
    month === currentMonth() ? new Date().getDate() : daysInMonth;
  const burnPerDay = totalOutflow / Math.max(daysElapsed, 1);
  const largestShare =
    largest && totalOutflow > 0
      ? Math.min(100, Math.round((largest.amount / totalOutflow) * 100))
      : 0;
  const monthProgress = Math.round((daysElapsed / daysInMonth) * 100);

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  }

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        breadcrumb={["Core ledger", "Expenses & Logs"]}
        title="Expenses & Transactions"
        description="A complete outflow ledger. Enter purchases inline, filter by month or category, and export any view as a CSV."
        actions={
          <>
            <Select
              aria-label="Filter by month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="h-10 w-[190px]"
            >
              {monthOptions().map((option) => (
                <option key={option} value={option}>
                  {formatMonth(option)}
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              onClick={() => downloadCsv(sorted, month, currency, fromUsd)}
              disabled={sorted.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total outflow"
          value={formatCurrency(data?.total ?? 0)}
          icon={ReceiptText}
          tone="indigo"
          badge={<Chip tone="indigo">Debited</Chip>}
          helper={`${formatMonth(month)} spending`}
        />
        <MetricCard
          label="Transactions"
          value={String(expenses.length)}
          icon={CalendarDays}
          tone="emerald"
          helper={`${currentPage} of ${totalPages} pages in view`}
        />
        <MetricCard
          label="Top category"
          value={topEntry ? expenseCategoryMeta(topEntry[0]).label : "—"}
          icon={TrendingDown}
          tone="sky"
          helper={topEntry ? formatCurrency(topEntry[1]) : "No expenses yet"}
        />
        <MetricCard
          label="Average ticket"
          value={formatCurrency(average)}
          icon={Wallet}
          tone="neutral"
          helper={largest ? `Largest: ${largest.title}` : "No records yet"}
        />
      </div>

      <div ref={quickRef} className="grid items-start gap-4 xl:grid-cols-[1.58fr_1fr]">
        <Card>
          <CardHeader
            title="Direct expense entry"
            subtitle="Post a transaction straight into this month's ledger"
          />
          <form onSubmit={addQuick} className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="sm:col-span-2 xl:col-span-4">
                <Label htmlFor="quick-title">Description</Label>
                <Input
                  id="quick-title"
                  value={quick.title}
                  onChange={(event) =>
                    setQuick((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Groceries, rent, train pass…"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quick-amount">Amount ({currency})</Label>
                <Input
                  id="quick-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quick.amount}
                  onChange={(event) =>
                    setQuick((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quick-date">Date</Label>
                <Input
                  id="quick-date"
                  type="date"
                  value={quick.spentOn}
                  onChange={(event) =>
                    setQuick((current) => ({
                      ...current,
                      spentOn: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="quick-category">Category</Label>
                <Select
                  id="quick-category"
                  value={quick.category}
                  onChange={(event) =>
                    setQuick((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                >
                  {EXPENSE_CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="quick-payment">Paid with</Label>
                <Select
                  id="quick-payment"
                  value={quick.paymentMethod}
                  onChange={(event) =>
                    setQuick((current) => ({
                      ...current,
                      paymentMethod: event.target.value,
                    }))
                  }
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end sm:col-span-2 xl:col-span-4">
                <Button type="submit" loading={quickSaving} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Post
                </Button>
              </div>
            </div>
            <FieldError>{quickError}</FieldError>
          </form>
        </Card>

        <Card>
          <CardHeader
            title="Ledger health"
            subtitle={`${formatMonth(month)} behaviour`}
          />
          <div className="space-y-3.5 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-lav px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Burn / day
                </p>
                <p className="mt-1 text-[13px] font-bold text-navy">
                  {formatCurrency(burnPerDay)}
                </p>
              </div>
              <div className="rounded-xl bg-lav px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Largest share
                </p>
                <p className="mt-1 text-[13px] font-bold text-navy">
                  {largestShare}%
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Month elapsed</span>
                <span className="font-semibold text-navy">
                  {daysElapsed}/{daysInMonth} days
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-lav">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 border-t border-line pt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Payment mix
              </p>
              {paymentMix.length === 0 ? (
                <p className="text-[10.5px] text-slate-400">
                  No payments recorded for this view.
                </p>
              ) : null}
              {paymentMix.map((method) => (
                <div key={method.label}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-medium text-slate-500">
                      {method.label}
                    </span>
                    <span className="font-semibold text-navy">
                      {formatCurrency(method.amount)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-lav">
                    <div
                      className="h-full rounded-full bg-indigo-brand"
                      style={{ width: `${Math.max(method.share, 1)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="rounded-lg bg-mint px-3 py-2 text-[10.5px] leading-relaxed text-forest">
              {largest
                ? `${largest.title} is the single biggest line at ${largestShare}% of outflow.`
                : "Post a transaction to start scoring this ledger."}
            </p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Outflow ledger"
          subtitle={`${formatMonth(month)} · ${expenses.length} ${
            expenses.length === 1 ? "record" : "records"
          }`}
          action={
            <button
              onClick={() => void load()}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-lav hover:text-navy"
              aria-label="Refresh expenses"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          }
        />

        <div className="flex flex-col gap-2.5 border-b border-line px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex h-10 flex-1 items-center gap-2 rounded-lg bg-lav px-3 text-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-forest/15">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or note…"
              className="h-full w-full bg-transparent text-[12.5px] text-navy outline-none placeholder:text-slate-400"
              aria-label="Search expenses"
            />
          </div>
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 sm:w-[180px]"
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by payment method"
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
            className="h-10 sm:w-[160px]"
          >
            <option value="">All payments</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Sort expenses"
            value={`${sortKey}:${sortDir}`}
            onChange={(event) => {
              const [key, dir] = event.target.value.split(":") as [
                SortKey,
                SortDir,
              ];
              setSortKey(key);
              setSortDir(dir);
            }}
            className="h-10 sm:w-[180px]"
          >
            <option value="date:desc">Newest first</option>
            <option value="date:asc">Oldest first</option>
            <option value="amount:desc">Highest amount</option>
            <option value="amount:asc">Lowest amount</option>
            <option value="title:asc">Description A–Z</option>
          </Select>
          <Select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-10 sm:w-[120px]"
          >
            <option value={8}>8 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
          </Select>
        </div>

        {error ? (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-700">
            {error}
          </div>
        ) : null}

        {loading && !data ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Receipt}
              title="No matching expenses"
              description="Try a different month or category, or post a transaction in the entry panel above."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-line bg-lav/40 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-5 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSort("date")}
                        className="inline-flex items-center gap-1 hover:text-navy"
                      >
                        Date {sortIcon("date")}
                      </button>
                    </th>
                    <th className="px-5 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSort("title")}
                        className="inline-flex items-center gap-1 hover:text-navy"
                      >
                        Description {sortIcon("title")}
                      </button>
                    </th>
                    <th className="px-5 py-2.5">Category</th>
                    <th className="px-5 py-2.5">Payment</th>
                    <th className="px-5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort("amount")}
                        className="inline-flex items-center gap-1 hover:text-navy"
                      >
                        Amount {sortIcon("amount")}
                      </button>
                    </th>
                    <th className="px-5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {pageRows.map((expense) => {
                    const meta = expenseCategoryMeta(expense.category);
                    return (
                      <tr
                        key={expense.id}
                        className="group transition hover:bg-lav/30"
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-[11px] font-medium text-slate-500">
                          {formatDate(expense.spentOn)}
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-[12.5px] font-semibold text-navy">
                            {expense.title}
                          </p>
                          {expense.note ? (
                            <p className="mt-0.5 max-w-[220px] truncate text-[10.5px] text-muted">
                              {expense.note}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-5 py-3">
                          <CategoryBadge label={meta.label} color={meta.color} />
                        </td>
                        <td className="px-5 py-3 text-[11px] text-muted">
                          {paymentMethodLabel(expense.paymentMethod)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-[12.5px] font-bold text-navy">
                          −{formatCurrency(expense.amount)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-0.5">
                            <button
                              onClick={() => openEdit(expense)}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-indigo-brand hover:shadow-sm"
                              aria-label={`Edit ${expense.title}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => void remove(expense)}
                              disabled={deletingId === expense.id}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600 hover:shadow-sm disabled:opacity-50"
                              aria-label={`Delete ${expense.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10.5px] text-slate-400">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, sorted.length)} of{" "}
                {sorted.length} records · page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-lav disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index + 1)}
                    className={cn(
                      "h-8 w-8 rounded-md text-[11px] font-semibold transition",
                      currentPage === index + 1
                        ? "bg-forest text-white"
                        : "border border-line text-slate-500 hover:bg-lav",
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-lav disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit expense" : "Add expense"}
        description="Record where your money went, how much, and how you paid."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="expense-title">Description</Label>
            <Input
              id="expense-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Groceries, rent, train pass…"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={form.spentOn}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    spentOn: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="expense-amount">Amount ({currency})</Label>
              <Input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="expense-category">Category</Label>
              <Select
                id="expense-category"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                {EXPENSE_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="expense-payment">Payment method</Label>
              <Select
                id="expense-payment"
                value={form.paymentMethod}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentMethod: event.target.value,
                  }))
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="expense-note" hint="Optional">
              Note
            </Label>
            <Textarea
              id="expense-note"
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder="Anything worth remembering about this purchase"
            />
          </div>

          <FieldError>{formError}</FieldError>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editing ? "Save changes" : "Add expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
