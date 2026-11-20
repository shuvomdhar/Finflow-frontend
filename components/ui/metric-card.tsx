import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  emerald: "bg-mint text-forest",
  indigo: "bg-indigo-50 text-indigo-brand",
  sky: "bg-sky-50 text-sky-600",
  neutral: "bg-lav text-slate-500",
} as const;

export function MetricCard({
  label,
  value,
  icon: Icon,
  badge,
  helper,
  tone = "emerald",
  children,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  helper?: ReactNode;
  tone?: keyof typeof tones;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-line bg-white p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
              tones[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="font-display text-[30px] font-extrabold leading-none tracking-tight text-navy">
          {value}
        </p>
        {badge}
      </div>

      {helper ? (
        <div className="mt-2 text-[11px] leading-relaxed text-muted">
          {helper}
        </div>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
