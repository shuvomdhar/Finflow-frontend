"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  KeyRound,
  Mail,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { useAccount } from "@/components/account/account-provider";
import { SignOutButton } from "@/components/account/sign-out-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FormAlert, Input, Label, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { authClient, clearAccessToken } from "@/lib/auth/client";
import { cn } from "@/lib/cn";
import { CURRENCIES, useCurrency } from "@/lib/currency";
import { useTheme } from "@/lib/theme";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "./actions";

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "F").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export function SettingsClient({
  name,
  email,
}: {
  name: string | null;
  email: string;
}) {
  const router = useRouter();
  const { me } = useAccount();
  const [state, formAction, pending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePasswordAction, null);

  const {
    currency,
    rate,
    rateReady,
    ratesUpdatedAt,
    loading: ratesLoading,
    error: ratesError,
    setCurrency,
    refreshRates,
    formatCurrency,
  } = useCurrency();
  const { theme, setTheme } = useTheme();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deleteAccount() {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Type DELETE to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await apiFetch<{ ok: boolean }>("/api/me", { method: "DELETE" });

      try {
        await authClient.signOut();
      } catch {
        // The session may already be invalid; continue clearing local state.
      }

      clearAccessToken();
      try {
        Object.keys(window.sessionStorage)
          .filter((key) => key.startsWith("finflow.status."))
          .forEach((key) => window.sessionStorage.removeItem(key));
      } catch {
        // Ignore storage failures.
      }

      router.replace("/auth/sign-in?deleted=1");
      router.refresh();
    } catch (deleteFailure) {
      setDeleting(false);
      setDeleteError(
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "Could not delete this account.",
      );
    }
  }

  return (
    <div className="animate-rise space-y-5">
      <PageHeader
        breadcrumb={["Preferences", "Settings & Profile"]}
        title="Settings & Profile"
        description="Your identity, display preferences, and security controls — all in one panel."
        actions={<SignOutButton className="rounded-lg border border-line bg-white px-3 py-2 hover:bg-lav" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Income records"
          value={me ? String(me.stats.incomeCount) : "…"}
          icon={CheckCircle2}
          tone="emerald"
          helper="Across every month"
        />
        <MetricCard
          label="Expense records"
          value={me ? String(me.stats.expenseCount) : "…"}
          icon={CheckCircle2}
          tone="indigo"
          helper="Across every month"
        />
        <MetricCard
          label="Member id"
          value={me ? `#${me.user.id}` : "…"}
          icon={UserRound}
          tone="neutral"
          helper="Internal integer identifier"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader title="Profile" subtitle="Your FinFlow identity" />
          <div className="p-5">
            <div className="flex items-center gap-3.5">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-forest text-base font-bold text-white shadow-sm">
                {initials(name, email)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-[17px] font-extrabold text-navy">
                  {name ?? "FinFlow user"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-muted">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] text-muted">Member id</dt>
                <dd className="text-[11.5px] font-semibold text-navy">
                  {me ? `#${me.user.id}` : <Skeleton className="h-4 w-10" />}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] text-muted">Display currency</dt>
                <dd className="text-[11.5px] font-semibold text-navy">
                  {currency}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[11px] text-muted">Session</dt>
                <dd className="text-[11.5px] font-semibold text-navy">
                  Signed in on this device
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-mint/70 px-3.5 py-3 text-[11px] leading-relaxed text-forest">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Sign-in is handled by Neon Auth. FinFlow stores your ledger
                against an internal integer member id — never your password.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Change password"
            subtitle="You stay signed in on this device"
          />
          <form action={formAction} className="space-y-3.5 p-5">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword" hint="8+ characters">
                New password
              </Label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            {state?.error ? <FormAlert>{state.error}</FormAlert> : null}
            {state?.success ? (
              <FormAlert tone="success">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {state.success}
                </span>
              </FormAlert>
            ) : null}

            <Button type="submit" className="w-full" loading={pending}>
              {pending ? "Updating…" : "Update password"}
              {!pending ? <KeyRound className="h-4 w-4" /> : null}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Preferences"
          subtitle="Currency, live exchange rates, and appearance"
        />
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <Label htmlFor="display-currency" hint="Live rates">
              Display currency
            </Label>
            <Select
              id="display-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} — {option.name}
                </option>
              ))}
            </Select>

            <div className="mt-3 rounded-xl bg-lav px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-medium text-slate-500">
                  {currency === "USD"
                    ? "Amounts are shown in US dollars."
                    : rateReady
                      ? `1 USD = ${rate.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })} ${currency}`
                      : "Fetching the live exchange rate…"}
                </p>
                <button
                  type="button"
                  onClick={() => void refreshRates()}
                  disabled={ratesLoading}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-navy transition hover:bg-lav disabled:opacity-60"
                  aria-label="Refresh exchange rates"
                >
                  <RefreshCw
                    className={cn("h-3 w-3", ratesLoading && "animate-spin")}
                  />
                  {ratesLoading ? "Refreshing" : "Refresh"}
                </button>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <span className="text-[10px] text-slate-400">
                  Preview · 1,234.50 USD
                </span>
                <span className="text-[12px] font-bold text-navy">
                  {formatCurrency(1234.5)}
                </span>
              </div>
            </div>

            {ratesError ? (
              <p className="mt-2 text-[10.5px] font-medium text-rose-600">
                {ratesError} Cached rates are used when available.
              </p>
            ) : null}

            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
              Rates by open.er-api.com · refreshed every 12 hours. Amounts are
              recorded in USD, so switching currencies never changes your data.
              {ratesUpdatedAt
                ? ` Updated ${new Date(ratesUpdatedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}.`
                : ""}
            </p>
          </div>

          <div>
            <Label>Theme</Label>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={theme === option.value}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition",
                    theme === option.value
                      ? "border-forest/40 bg-mint/60"
                      : "border-line bg-lav/40 hover:bg-lav",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg",
                      theme === option.value
                        ? "bg-forest text-white"
                        : "bg-white text-slate-500",
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-[12.5px] font-semibold text-navy">
                    {option.label}
                  </span>
                  {theme === option.value ? (
                    <Check className="h-4 w-4 text-forest" />
                  ) : null}
                </button>
              ))}
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
              Your choice is saved on this device and applied before the first
              paint, so there is no flash of the wrong theme.
            </p>

            <div className="mt-4 rounded-xl border border-line px-3.5 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Ledger base currency
              </p>
              <p className="mt-1 text-[12px] font-semibold text-navy">
                USD · converted on read
              </p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-400">
                Reports, CSV exports, and PDF statements follow the currency you
                pick here.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-rose-200/70">
        <CardHeader
          title="Delete account"
          subtitle="Permanently remove this ledger"
        />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="max-w-xl">
              <p className="text-[12.5px] font-semibold text-navy">
                Deleting your account erases every income and expense record.
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                This action cannot be undone, and you will be signed out
                immediately.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmText("");
              setDeleteError(null);
              setDeleteOpen(true);
            }}
            className="shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </div>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        title="Delete this account?"
        description="Every income and expense record will be permanently deleted."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-[12px] leading-relaxed text-rose-700">
            <p className="font-semibold">This cannot be undone.</p>
            <p className="mt-1">
              Type <span className="font-bold">DELETE</span> below to confirm
              that you want to remove this account.
            </p>
          </div>

          <div>
            <Label htmlFor="delete-confirm">Confirmation</Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>

          {deleteError ? <FormAlert>{deleteError}</FormAlert> : null}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Keep my account
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              loading={deleting}
              onClick={() => void deleteAccount()}
            >
              Delete & sign out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
