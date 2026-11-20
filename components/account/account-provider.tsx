"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth/client";
import type { MeResponse } from "@/lib/types";

type AccountState = {
  me: MeResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AccountContext = createContext<AccountState | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await apiFetch<MeResponse>("/api/me");
      setMe(result);
      setError(null);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 403) {
        clearAccessToken();
        router.replace("/auth/sign-in?deleted=1");
        return;
      }
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Could not load your account.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Defer one tick: `refresh` settles state after its network await, which
    // keeps this effect free of synchronous set-state cascades.
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  return (
    <AccountContext.Provider value={{ me, loading, error, refresh }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountState {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used inside AccountProvider");
  }
  return context;
}
