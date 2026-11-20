"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormAlert, Input, Label } from "@/components/ui/field";
import { signInAction, type AuthState } from "./actions";

export function SignInForm({
  deleted,
  signedOut,
}: {
  deleted: boolean;
  signedOut: boolean;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    null,
  );

  return (
    <div className="animate-rise">
      <AuthHeader
        title="Welcome back"
        description="Sign in to pick up right where you left off."
      />

      {deleted ? (
        <div className="mb-4">
          <FormAlert tone="warning">
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This account was deleted, so its ledger is gone. Create a new
                account to start fresh.
              </span>
            </span>
          </FormAlert>
        </div>
      ) : null}

      {signedOut && !deleted ? (
        <div className="mb-4">
          <FormAlert tone="success">
            <span className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>You are signed out. See you next time.</span>
            </span>
          </FormAlert>
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11"
            required
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[11.5px] font-semibold text-forest hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
        </div>

        {state?.error ? <FormAlert>{state.error}</FormAlert> : null}

        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {pending ? "Signing in…" : "Sign in"}
          {!pending ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-muted">
        New to FinFlow?{" "}
        <Link
          href="/auth/sign-up"
          className="font-semibold text-forest hover:underline"
        >
          Create a free account
        </Link>
      </p>

      <div className="mt-7 rounded-xl border border-line bg-white p-4 text-center text-[11px] leading-relaxed text-muted">
        Your account is secured by Neon Auth. FinFlow never stores your
        password.
      </div>
    </div>
  );
}
