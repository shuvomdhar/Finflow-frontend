"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { applyTheme, readTheme } from "@/lib/theme";

/**
 * Light/dark switch. The root layout applies the stored theme before paint so
 * there is no flash of the wrong palette. The icon is chosen with CSS, which
 * keeps this component free of a mount effect.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    applyTheme(readTheme() === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle light / dark theme"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-lav text-slate-500 transition hover:bg-lav-deep hover:text-forest",
        className,
      )}
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
