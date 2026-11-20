"use client";

import {
  Coins,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CategoryDonut } from "@/components/charts/category-donut";
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
import { INCOME_CATEGORIES, incomeCategoryMeta } from "@/lib/constants";
import {
  currentMonth,
  formatMonth,
  formatMonthShort,
  monthOptions,
} from "@/lib/format";
import type { CategoryTotal, Income, Overview } from "@/lib/types";
import { useCurrency } from "@/lib/currency";

type IncomeResponse = { incomes: Income[]; total: number };

const emptyForm = (month: string) => ({
  month,
  source: "",
  category: "salary",
  amount: "",
  note: "",
});

export function IncomeClient({ initialNew }: { initialNew: boolean }) {
  const { formatCurrency, currency, toUsd, fromUsd } = useCurrency();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<IncomeResponse | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(initialNew);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState(emptyForm(currentMonth()));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, monthOverview] = await Promise.all([
        apiFetch<IncomeResponse>(
          `/api/incomes?month=${encodeURIComponent(month)}`,
        ),
        apiFetch<Overview>(`/api/overview?month=${encodeURIComponent(month)}`),
      ]);
      setData(result);
      setOverview(monthOverview);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load income.",
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

  function openAdd() {
    setEditing(null);
    setForm(emptyForm(month));
    setFormError(null);
    setOpen(true);
  }

  function openEdit(income: Income) {
    setEditing(income);
    setForm({
      month: income.month,
      source: income.source,
      category: income.category,
      amount: String(fromUsd(income.amount)),
      note: income.note ?? "",
    });
    setFormError(null);
    setOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = Number(form.amount);

    if (!form.source.trim()) {
      setFormError("Add a source, such as your employer or client.");
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
      await apiFetch<{ income: Income }>(
        editing ? `/api/incomes/${editing.id}` : "/api/incomes",
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({
            month: form.month,
            source: form.source.trim(),
            category: form.category,
            amount,
            note: form.note.trim() || null,
          }),
        },
      );
      setOpen(false);
      if (form.month !== month) setMonth(form.month);
      else await load();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save this income.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(income: Income) {
    if (!window.confirm(`Delete "${income.source}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(income.id);
    try {
      await apiFetch<{ ok: boolean }>(`/api/incomes/${income.id}`, {
        method: "DELETE",
      });
      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this income.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const incomes = data?.incomes ?? [];
  const total = data?.total ?? 0;
  const largest = incomes.reduce<Income | null>(
    (best, income) => (!best || income.amount > best.amount ? income : best),
    null,
  );
  const average = incomes.length > 0 ? total / incomes.length : 0;
  const extraIncome = incomes
    .filter((income) => income.category !== "salary")
    .reduce((sum, income) => sum + income.amount, 0);

  const composition: CategoryTotal[] = Object.entries(
    incomes.reduce<Record<string, number>>((totals, income) => {
      totals[income.category] = (totals[income.category] ?? 0) + income.amount;
      return totals;
    }, {}),
  )
    .map(([category, amount]) => ({ category, total: amount }))
    .sort((a, b) => b.total - a.total);

  const retained = overview?.balance ?? 0;
  const retainedShare =
    total > 0
      ? Math.max(0, Math.min(100, Math.round((retained / total) * 100)))
      : 0;
  const spentShare = total > 0 ? Math.max(0, 100 - retainedShare) : 0;

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        breadcrumb={["Core ledger", "Income & Cashflow"]}
        title="Income & Revenue Streams"
        description="Salary plus every additional source in a single audited inflow ledger. Track where the money comes from before it moves."
        actions={
          <>
            <Select
              aria-label="Select month"
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
            <Button onClick={openAdd} size="md">
              <Plus className="h-4 w-4" />
              Add income
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total inflow"
          value={formatCurrency(total)}
          icon={Wallet}
          tone="emerald"
          badge={<Chip tone="green">Cleared</Chip>}
          helper={`${formatMonth(month)} inflow`}
        />
        <MetricCard
          label="Active streams"
          value={String(incomes.length)}
          icon={Coins}
          tone="indigo"
          helper={`${formatCurrency(extraIncome)} from non-salary sources`}
        />
        <MetricCard
          label="Largest stream"
          value={largest ? formatCurrency(largest.amount) : "—"}
          icon={TrendingUp}
          tone="sky"
          helper={largest ? largest.source : "No income logged yet"}
        />
        <MetricCard
          label="Average per stream"
          value={formatCurrency(average)}
          icon={Landmark}
          tone="neutral"
          helper="Across every source this month"
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Inflow ledger"
            subtitle={`${formatMonth(month)} · ${incomes.length} ${
              incomes.length === 1 ? "record" : "records"
            }`}
            action={
              <button
                onClick={() => void load()}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-lav hover:text-navy"
                aria-label="Refresh income"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            }
          />

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
          ) : incomes.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Wallet}
                title="No income for this month"
                description="Add your salary or any extra money that arrived. You can log multiple sources."
                action={
                  <Button onClick={openAdd} size="sm">
                    <Plus className="h-4 w-4" />
                    Add your first income
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-line bg-lav/40 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-5 py-2.5">Period</th>
                    <th className="px-5 py-2.5">Source</th>
                    <th className="px-5 py-2.5">Category</th>
                    <th className="px-5 py-2.5">Note</th>
                    <th className="px-5 py-2.5 text-right">Amount</th>
                    <th className="px-5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {incomes.map((income) => {
                    const meta = incomeCategoryMeta(income.category);
                    return (
                      <tr key={income.id} className="group hover:bg-lav/30">
                        <td className="whitespace-nowrap px-5 py-3 text-[11px] font-medium text-slate-500">
                          {formatMonthShort(income.month)}
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-[12.5px] font-semibold text-navy">
                            {income.source}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <CategoryBadge
                            label={meta.label}
                            color={meta.color}
                          />
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-[11px] text-muted">
                          {income.note ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-[12.5px] font-bold text-emerald-brand">
                          +{formatCurrency(income.amount)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-0.5">
                            <button
                              onClick={() => openEdit(income)}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-indigo-brand hover:shadow-sm"
                              aria-label={`Edit ${income.source}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => void remove(income)}
                              disabled={deletingId === income.id}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600 hover:shadow-sm disabled:opacity-50"
                              aria-label={`Delete ${income.source}`}
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
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Revenue composition"
              subtitle={`Source mix · ${formatMonthShort(month)}`}
            />
            <div className="p-5">
              <CategoryDonut
                categories={composition}
                total={total}
                kind="income"
                centerLabel="Inflow"
                maxRows={6}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Destination vaults"
              subtitle="Where this month's inflow landed"
            />
            <div className="space-y-3 p-5">
              <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-lav">
                <span
                  className="h-full rounded-full bg-forest transition-all"
                  style={{ width: `${Math.max(retainedShare, 1)}%` }}
                />
                <span
                  className="h-full rounded-full bg-indigo-brand transition-all"
                  style={{ width: `${Math.max(spentShare, 1)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  Retained {retainedShare}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-brand" />
                  Spent {spentShare}%
                </span>
              </div>

              <div className="rounded-xl border border-line px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[11px] font-semibold text-forest">
                    <Landmark className="h-3.5 w-3.5" />
                    Retained reserve
                  </span>
                  <span className="text-[12.5px] font-bold text-forest">
                    {formatCurrency(Math.max(retained, 0))}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {overview?.savingsRate ?? 0}% of inflow kept after outflow
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-lav">
                  <div
                    className="h-full rounded-full bg-forest"
                    style={{ width: `${Math.max(retainedShare, 2)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-line px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[11px] font-semibold text-indigo-brand">
                    <Coins className="h-3.5 w-3.5" />
                    Expense vault
                  </span>
                  <span className="text-[12.5px] font-bold text-navy">
                    {formatCurrency(overview?.expense ?? 0)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Paid out across this month&apos;s ledger
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-lav">
                  <div
                    className="h-full rounded-full bg-indigo-brand"
                    style={{ width: `${Math.max(spentShare, 2)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-navy px-3.5 py-2.5 text-white">
                <span className="text-[11px] font-semibold text-slate-300">
                  Net settled
                </span>
                <span
                  className={
                    retained >= 0
                      ? "text-[12.5px] font-bold text-emerald-300"
                      : "text-[12.5px] font-bold text-rose-300"
                  }
                >
                  {formatCurrency(retained)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit income" : "Add income"}
        description="Salary, freelance payment, gift — log every source separately."
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="income-source">Source</Label>
            <Input
              id="income-source"
              value={form.source}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  source: event.target.value,
                }))
              }
              placeholder="Acme salary, Upwork client…"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="income-month">Month</Label>
              <Input
                id="income-month"
                type="month"
                value={form.month}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    month: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="income-amount">Amount ({currency})</Label>
              <Input
                id="income-amount"
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

          <div>
            <Label htmlFor="income-category">Category</Label>
            <Select
              id="income-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              {INCOME_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="income-note" hint="Optional">
              Note
            </Label>
            <Textarea
              id="income-note"
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
              placeholder="Anything you want to remember about this income"
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
              {editing ? "Save changes" : "Add income"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
