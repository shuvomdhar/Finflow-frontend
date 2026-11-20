import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  actions,
}: {
  breadcrumb?: string[];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const trail = breadcrumb ?? (eyebrow ? [eyebrow] : []);

  return (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        {trail.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
          >
            {trail.map((crumb, index) => (
              <span key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight className="h-3 w-3 text-slate-300" />
                ) : null}
                <span
                  className={
                    index === trail.length - 1 ? "text-slate-500" : undefined
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        ) : null}

        <h1 className="mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-tight text-navy sm:text-[34px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
