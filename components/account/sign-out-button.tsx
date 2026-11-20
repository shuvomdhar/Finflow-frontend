"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { authClient, clearAccessToken } from "@/lib/auth/client";
import { cn } from "@/lib/cn";

function clearSessionFlags() {
  try {
    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith("finflow.status."))
      .forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Signs out in the right order: the account is marked inactive while the JWT
 * is still valid, then the Neon Auth session cookie is cleared.
 */
export function SignOutButton({
  className,
  children,
  showIcon = true,
}: {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);

    try {
      await apiFetch("/api/me/status", {
        method: "PATCH",
        body: JSON.stringify({ status: "inactive" }),
      });
    } catch {
      // A status write failure must never trap the user in the session.
    }

    try {
      await authClient.signOut();
    } catch {
      // The cookie may already be gone; continue to the landing page.
    }

    clearAccessToken();
    clearSessionFlags();
    router.replace("/?signedOut=1");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 text-[12px] font-semibold text-slate-500 transition hover:text-navy disabled:opacity-60",
        className,
      )}
    >
      {showIcon ? <LogOut className="h-4 w-4" /> : null}
      {children ?? (pending ? "Signing out…" : "Sign out")}
    </button>
  );
}
