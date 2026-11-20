import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-forest text-white shadow-sm hover:bg-forest-deep focus-visible:outline-forest",
  outline:
    "border border-line bg-white text-navy hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
  soft: "bg-lav text-navy hover:bg-lav-deep focus-visible:outline-slate-400",
  ghost: "text-slate-600 hover:bg-lav hover:text-navy",
} as const;

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: keyof typeof variants;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        base,
        variants[variant],
        size === "sm"
          ? "h-9 px-3.5 text-[13px]"
          : size === "lg"
            ? "h-12 px-6 text-[15px]"
            : "h-10 px-4 text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
