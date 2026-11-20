"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartSpline,
  ChevronDown,
  LayoutDashboard,
  LineChart,
  Menu,
  Minus,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccountProvider, useAccount } from "@/components/account/account-provider";
import { SignOutButton } from "@/components/account/sign-out-button";
import { StatusSync } from "@/components/account/status-sync";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { CURRENCIES, CurrencyProvider, useCurrency } from "@/lib/currency";

const NAV_GROUPS = [
  {
    label: "Core ledger",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/income", label: "Income & Cashflow", icon: LineChart },
      { href: "/expenses", label: "Expenses & Logs", icon: ReceiptText },
      { href: "/reports", label: "Analytics & Trends", icon: ChartSpline },
    ],
  },
  {
    label: "Preferences",
    items: [
      { href: "/settings", label: "Settings & Profile", icon: Settings },
    ],
  },
];

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "F").concat(parts[1]?.[0] ?? "").toUpperCase();
}

function SidebarContent({
  user,
  onNavigate,
}: {
  user: { name: string | null; email: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between px-5 pb-5 pt-5">
        <Brand href="/dashboard" />
        {onNavigate ? (
          <button
            onClick={onNavigate}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-lav hover:text-navy lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-white text-navy shadow-sm ring-1 ring-line"
                        : "text-slate-500 hover:bg-white/70 hover:text-navy",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active
                          ? "text-forest"
                          : "text-slate-400 group-hover:text-slate-600",
                      )}
                      strokeWidth={1.9}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-3 rounded-xl bg-lav-deep/70 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-forest shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              Vault Mode
            </p>
            <p className="text-[12px] font-bold text-navy">Audited Secure</p>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
            {initials(user.name, user.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-navy">
              {user.name ?? "FinFlow user"}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">
              {user.email}
            </p>
          </div>
          <SignOutButton className="rounded-lg p-1.5 hover:bg-white" showIcon />
        </div>
      </div>
    </div>
  );
}

function TopBar({
  user,
  onOpenMenu,
}: {
  user: { name: string | null; email: string };
  onOpenMenu: () => void;
}) {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/expenses?search=${encodeURIComponent(term)}` : "/expenses");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenMenu}
          className="rounded-lg border border-line p-2 text-slate-500 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <form
          onSubmit={submitSearch}
          role="search"
          className="hidden min-w-0 flex-1 md:block md:max-w-[340px]"
        >
          <div className="flex h-9 items-center gap-2 rounded-xl bg-lav px-3 text-slate-400 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-forest/15">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transactions, sources, tags..."
              aria-label="Search transactions"
              className="h-full w-full bg-transparent text-[12px] text-navy outline-none placeholder:text-slate-400"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <div
            className="hidden h-9 items-center gap-1.5 rounded-xl bg-lav pl-3 pr-1.5 text-[11px] font-semibold text-slate-500 lg:flex"
            title="Amounts are stored in USD and converted at live exchange rates"
          >
            <span>Currency</span>
            <div className="relative">
              <select
                aria-label="Quick currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="h-7 cursor-pointer appearance-none rounded-md bg-transparent pl-1 pr-4 text-[11px] font-bold text-navy outline-none"
              >
                {CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <Link
            href="/income?new=1"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-forest px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-forest-deep"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Income</span>
            <span className="sm:hidden">Income</span>
          </Link>
          <Link
            href="/expenses?new=1"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-lav px-3 text-[12px] font-semibold text-navy transition hover:bg-lav-deep"
          >
            <Minus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Expense</span>
          </Link>

          <Link
            href="/settings"
            className="relative hidden h-9 w-9 place-items-center rounded-lg bg-lav text-slate-500 transition hover:bg-lav-deep sm:grid"
            aria-label="Settings and profile"
            title="Settings and profile"
          >
            <Settings className="h-4 w-4" />
          </Link>

          <ThemeToggle className="h-9 w-9 shrink-0" />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition hover:bg-lav"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                {initials(user.name, user.email)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[130px] truncate text-[12px] font-semibold leading-tight text-navy">
                  {user.name ?? "FinFlow user"}
                </span>
                <span className="block truncate text-[10px] leading-tight text-slate-400">
                  {user.email}
                </span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="shadow-pop absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-xl border border-line bg-white"
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-[13px] font-semibold text-navy">
                    {user.name ?? "FinFlow user"}
                  </p>
                  <p className="truncate text-[11px] text-muted">{user.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-slate-600 hover:bg-lav hover:text-navy"
                  >
                    <Settings className="h-4 w-4" />
                    Settings & profile
                  </Link>
                  <Link
                    href="/reports"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-slate-600 hover:bg-lav hover:text-navy"
                  >
                    <ChartSpline className="h-4 w-4" />
                    Analytics & trends
                  </Link>
                </div>
                <div className="border-t border-line px-3 py-2.5">
                  <SignOutButton className="w-full justify-start rounded-lg px-1.5 py-1" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function Shell({
  user,
  children,
}: {
  user: { name: string | null; email: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Keying the drawer to the current path closes it automatically on navigation.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const mobileOpen = menuPath === pathname;
  const setMobileOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const { me } = useAccount();

  return (
    <div className="min-h-screen bg-canvas">
      {me ? <StatusSync userId={me.user.id} /> : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-line lg:block">
        <SidebarContent user={user} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-rise absolute inset-y-0 left-0 w-[270px] border-r border-line shadow-float">
            <SidebarContent
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[248px]">
        <TopBar user={user} onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1420px] px-4 py-6 sm:px-6 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: { name: string | null; email: string };
  children: ReactNode;
}) {
  return (
    <AccountProvider>
      <CurrencyProvider>
        <Shell user={user}>{children}</Shell>
      </CurrencyProvider>
    </AccountProvider>
  );
}
