import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  Check,
  FileDown,
  LockKeyhole,
  PieChart,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LinkButton } from "@/components/ui/link-button";

const FEATURES = [
  {
    icon: Wallet,
    title: "Every income source",
    description:
      "Log your monthly salary, then add freelance payments, gifts, or investment income as separate sources.",
    tone: "bg-emerald-50 text-emerald-brand",
  },
  {
    icon: PieChart,
    title: "Categorized spending",
    description:
      "Sort every purchase into clear categories so you can see the difference between essentials and extras.",
    tone: "bg-indigo-50 text-indigo-brand",
  },
  {
    icon: BarChart3,
    title: "Year and month charts",
    description:
      "Switch between a full-year view and a single month to spot trends before they become habits.",
    tone: "bg-sky-50 text-sky-600",
  },
  {
    icon: FileDown,
    title: "Downloadable PDF",
    description:
      "Generate a clean statement with totals, every transaction, and a category breakdown in one click.",
    tone: "bg-slate-100 text-navy",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Sign-in is handled by Neon Auth with short-lived tokens. FinFlow never stores your password.",
    tone: "bg-emerald-50 text-emerald-brand",
  },
  {
    icon: LockKeyhole,
    title: "Your data, only yours",
    description:
      "Financial records are tied to your account and an internal integer member id — never shared.",
    tone: "bg-indigo-50 text-indigo-brand",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up with your email in seconds. No card, no trial countdown, no verification codes.",
    icon: Sparkles,
  },
  {
    number: "02",
    title: "Add income and expenses",
    description:
      "Start with this month's salary, then log purchases as they happen. Add notes for anything unusual.",
    icon: Plus,
  },
  {
    number: "03",
    title: "Read the story",
    description:
      "Open your overview or reports to see what you kept, where you spent, and how the year is trending.",
    icon: CalendarRange,
  },
];

const MONTHS = [
  { label: "Jul", income: 74, expense: 42 },
  { label: "Aug", income: 82, expense: 51 },
  { label: "Sep", income: 70, expense: 44 },
  { label: "Oct", income: 88, expense: 58 },
  { label: "Nov", income: 94, expense: 49 },
  { label: "Dec", income: 84, expense: 61 },
];

const CATEGORY_SPLIT = [
  { label: "Housing", value: 34, color: "#4F46E5" },
  { label: "Food", value: 26, color: "#059669" },
  { label: "Transport", value: 18, color: "#0EA5E9" },
  { label: "Bills", value: 12, color: "#0F172A" },
  { label: "Other", value: 10, color: "#94A3B8" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ signedOut?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-navy">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-navy">
              How it works
            </a>
            <a href="#reports" className="transition hover:text-navy">
              Reports
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="bg-white ring-1 ring-line" />
            <Link
              href="/auth/sign-in"
              className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-navy sm:inline-flex"
            >
              Sign in
            </Link>
            <LinkButton href="/auth/sign-up" size="sm">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </LinkButton>
          </div>
        </div>
      </header>

      <main>
        {params.signedOut === "1" ? (
          <div className="border-b border-emerald-200 bg-mint/70">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-5 py-2.5 text-[12px] font-medium text-forest sm:px-8">
              <Check className="h-4 w-4" />
              You are signed out. Sign in whenever you are ready.
            </div>
          </div>
        ) : null}

        {/* Hero */}
        <section className="hero-glow relative overflow-hidden">
          <div className="dotted-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pb-28 lg:pt-24">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-brand shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Personal finance, simplified
              </p>

              <h1 className="mt-6 max-w-xl text-[40px] font-extrabold leading-[1.05] tracking-tight text-navy sm:text-[54px]">
                Your money,
                <br />
                <span className="bg-gradient-to-r from-emerald-brand via-emerald-500 to-sky-brand bg-clip-text text-transparent">
                  clearly.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-slate-600">
                FinFlow brings your monthly income and everyday spending into
                one calm view. Track extra income sources, filter charts by year
                or month, and download a clean PDF whenever you need it.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/auth/sign-up" size="lg">
                  Start tracking free
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton href="/auth/sign-in" size="lg" variant="outline">
                  I already have an account
                </LinkButton>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-slate-500">
                {["Free forever", "No OTP codes", "Export anytime"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-brand" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Product preview */}
            <div className="animate-rise relative [animation-delay:120ms]">
              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-emerald-brand/10 via-indigo-brand/10 to-sky-brand/10 blur-2xl" />
              <div className="relative rounded-3xl border border-line bg-white p-5 shadow-float sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                      November overview
                    </p>
                    <p className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-navy">
                      $4,333.85
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      kept after expenses this month
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-brand">
                    <TrendingUp className="h-3.5 w-3.5" />
                    70.5%
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-line bg-slate-50/60 p-3.5">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-brand" />
                      Income
                    </p>
                    <p className="mt-1.5 text-lg font-bold text-navy">
                      $6,150.50
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line bg-slate-50/60 p-3.5">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-brand" />
                      Expenses
                    </p>
                    <p className="mt-1.5 text-lg font-bold text-navy">
                      $1,816.65
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-line p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-bold text-navy">
                      Income vs expenses
                    </p>
                    <span className="text-[10px] font-medium text-muted">
                      12-month view
                    </span>
                  </div>
                  <div className="flex h-[132px] items-end justify-between gap-2.5">
                    {MONTHS.map((month) => (
                      <div
                        key={month.label}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div className="flex h-[104px] w-full items-end justify-center gap-1">
                          <span
                            className="w-[42%] rounded-t-md bg-emerald-brand/90"
                            style={{ height: `${month.income}%` }}
                          />
                          <span
                            className="w-[42%] rounded-t-md bg-indigo-brand/85"
                            style={{ height: `${month.expense}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-muted">
                          {month.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-navy px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-emerald-300">
                    <TrendingDown className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] leading-snug text-slate-300">
                    Spending dropped{" "}
                    <span className="font-bold text-white">18%</span> versus
                    last month — mostly dining out.
                  </p>
                </div>
              </div>

              <div className="animate-float absolute -right-3 bottom-8 hidden rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-card sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Freelance
                </p>
                <p className="mt-0.5 text-sm font-bold text-emerald-brand">
                  +$950.00
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 text-center sm:flex-row sm:px-8 sm:text-left">
            <p className="text-[13px] font-medium text-slate-500">
              Built on a modern stack so your records stay fast and available.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-bold text-slate-400">
              <span>Neon Postgres</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>Neon Auth</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>PDF statements</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-brand">
              Everything in one place
            </p>
            <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-navy sm:text-[40px]">
              Built for the way you actually spend
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              No spreadsheets, no formulas, no mystery categories. Just a clear
              record of money in and money out.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-float"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl ${feature.tone}`}
                >
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-line bg-white">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-brand">
                  How it works
                </p>
                <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-navy sm:text-[40px]">
                  From sign-up to insight in three steps
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
                  FinFlow stays out of your way. Add what happened, and the
                  numbers organize themselves.
                </p>

                <div className="mt-8 hidden rounded-2xl border border-line bg-canvas p-5 lg:block">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-brand text-white">
                      <FileDown className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy">
                        One-click PDF statements
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Totals, transactions, and category breakdown.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {STEPS.map((step) => (
                  <div
                    key={step.number}
                    className="flex gap-4 rounded-2xl border border-line bg-canvas/60 p-5"
                  >
                    <div className="flex flex-col items-center">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-brand shadow-sm">
                        <step.icon className="h-5 w-5" />
                      </span>
                      <span className="mt-2 font-display text-[11px] font-extrabold tracking-[0.16em] text-slate-400">
                        {step.number}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-navy">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reports */}
        <section id="reports" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                      Spending by category
                    </p>
                    <p className="mt-1 text-sm text-slate-600">November 2026</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-navy">
                    $1,816.65
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {CATEGORY_SPLIT.map((category) => (
                    <div key={category.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-600">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.label}
                        </span>
                        <span className="font-semibold text-navy">
                          {category.value}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${category.value}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-xs">
                  <span className="font-medium text-emerald-900/80">
                    Income kept this month
                  </span>
                  <span className="font-bold text-emerald-brand">70.5%</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
                Reports that answer questions
              </p>
              <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-navy sm:text-[40px]">
                See the year, then drill into the month
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600">
                Start with a full-year chart of income versus expenses. Pick a
                month to see daily spending, then download the same view as a
                polished PDF.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  "Year-wise and month-wise spending filters",
                  "Category and income-source breakdowns",
                  "Daily spending chart for any month",
                  "Downloadable PDF with every transaction",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-brand">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/sign-up"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-brand hover:underline"
              >
                Explore your own reports
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="hero-glow pointer-events-none absolute inset-0 opacity-80" />
            <div className="dotted-grid pointer-events-none absolute inset-0 opacity-20" />
            <div className="relative mx-auto max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                Start today
              </p>
              <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-white sm:text-[42px]">
                Your money makes more sense when you can see it
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
                Create a free FinFlow account and get a clear picture of this
                month in a few minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LinkButton
                  href="/auth/sign-up"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 px-6 text-[15px] font-semibold text-white transition hover:bg-white/5 sm:w-auto"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted">
              A personal expense tracker for income, spending, and savings
              clarity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] font-medium text-slate-500">
            <a href="#features" className="transition hover:text-navy">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-navy">
              How it works
            </a>
            <Link href="/auth/sign-up" className="transition hover:text-navy">
              Create account
            </Link>
            <Link href="/auth/sign-in" className="transition hover:text-navy">
              Sign in
            </Link>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>© {new Date().getFullYear()} FinFlow. Your money, clearly.</p>
            <p>Built with Next.js, Neon Postgres, and Neon Auth.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
