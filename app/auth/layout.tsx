import {
  ArrowUpRight,
  ChartSpline,
  Coins,
  FileDown,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const HIGHLIGHTS = [
  { icon: ChartSpline, text: "Year-wise and month-wise spending charts" },
  { icon: FileDown, text: "Download clean PDF expense statements" },
  { icon: ShieldCheck, text: "Secure sign-in powered by Neon Auth" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(155deg,#0f172a_0%,#0b3b2a_60%,#075236_100%)] p-12 lg:flex lg:flex-col">
        <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="dotted-grid pointer-events-none absolute inset-0 opacity-10" />

        <div className="relative z-10">
          <Brand light />
        </div>

        <div className="relative z-10 my-auto max-w-md py-14">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
            Audited personal ledger
          </p>
          <h1 className="font-display text-[42px] font-extrabold leading-[1.06] text-white">
            Your money,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              clearly.
            </span>
          </h1>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-slate-400">
            Every paycheck, side project, and everyday purchase in one ledger.
            Understand your month in seconds.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-emerald-300">
                  <Coins className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Currency aware
                  </p>
                  <p className="text-[12px] font-semibold text-white">
                    Live exchange rates
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-300">
                Auto
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {["USD", "EUR", "GBP", "BDT"].map((code) => (
                <div
                  key={code}
                  className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-center"
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    {code}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-8 space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-emerald-300">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-[12.5px] text-slate-300">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-500">
          <span>Built on Neon Postgres + Neon Auth</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle className="bg-white ring-1 ring-line" />
        </div>
        <div className="w-full max-w-[410px]">
          <div className="mb-7 lg:hidden">
            <Brand />
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
            {children}
          </div>
          <p className="mt-6 text-center text-[10.5px] text-slate-400">
            FinFlow · Personal finance, clearly.
          </p>
        </div>
      </main>
    </div>
  );
}
