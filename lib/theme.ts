"use client";

import { useCallback, useEffect, useState } from "react";

export const THEME_KEY = "finflow-theme";
export type Theme = "light" | "dark";

const THEME_EVENT = "finflow-theme-change";

export function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Fall through to the applied class.
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // The class still switches when storage is unavailable.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * Reads the theme applied by the pre-paint script and keeps every mounted
 * control in sync, no matter where the change originated.
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
} {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => setThemeState(readTheme());
    const timer = setTimeout(sync, 0);
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
