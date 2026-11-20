import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

export function Brand({
  light = false,
  compact = false,
  href = "/",
}: {
  light?: boolean;
  compact?: boolean;
  href?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg shadow-sm",
          light
            ? "bg-white/10 ring-1 ring-white/15"
            : "bg-forest shadow-forest/20",
        )}
      >
        <TrendingUp
          className={cn("h-4 w-4", light ? "text-white" : "text-white")}
          strokeWidth={2.6}
        />
      </span>
      {!compact ? (
        <span
          className={cn(
            "font-display text-[19px] font-extrabold tracking-tight",
            light ? "text-white" : "text-navy",
          )}
        >
          FinFlow
        </span>
      ) : null}
    </Link>
  );
}
