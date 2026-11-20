"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAccount } from "@/components/account/account-provider";
import { apiFetch, ApiError } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth/client";

const SESSION_FLAG = "finflow.status.synced";

/**
 * Reports a successful sign-in once per browser session.
 *
 * Mounting the app shell means the user has a valid session, so the account is
 * marked active. If the backend no longer accepts this account, the session is
 * ended and the user is sent back to sign-in.
 */
export function StatusSync({ userId }: { userId: number }) {
  const router = useRouter();
  const { refresh } = useAccount();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const key = `${SESSION_FLAG}.${userId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
    } catch {
      // Private mode: still report the status once for this render.
    }

    void (async () => {
      try {
        await apiFetch("/api/me/status", {
          method: "PATCH",
          body: JSON.stringify({ status: "active" }),
        });
        try {
          window.sessionStorage.setItem(key, "1");
        } catch {
          // Ignore storage failures.
        }
        await refresh();
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          clearAccessToken();
          router.replace("/auth/sign-in?deleted=1");
          router.refresh();
        }
      }
    })();
  }, [refresh, router, userId]);

  return null;
}
