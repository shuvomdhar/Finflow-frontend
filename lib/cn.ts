import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves conflicting Tailwind utilities so the last
 * one wins (e.g. `w-full` + `w-[160px]` keeps the fixed width).
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
