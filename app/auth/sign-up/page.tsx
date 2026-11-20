"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useActionState } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormAlert, Input, Label } from "@/components/ui/field";
import { signUpAction, type SignUpState } from "./actions";

const PERKS = ["Free forever", "No card required", "Export anytime"];

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUpAction,
    null,
  );

  return (
    <div className="animate-rise">
      <AuthHeader
        title="Create your FinFlow account"
        description="Start seeing your income and spending in one clear view."
      >
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {PERKS.map((perk) => (
            <span
              key={perk}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500"
            >
              <Check className="h-3.5 w-3.5 text-forest" />
              {perk}
            </span>
          ))}
        </div>
      </AuthHeader>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Alex Morgan"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password" hint="8+ characters">
              Password
            </Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>
        </div>

        {state?.error ? <FormAlert>{state.error}</FormAlert> : null}

        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {pending ? "Creating account…" : "Create account"}
          {!pending ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          By creating an account you agree to keep your own financial data
          accurate. FinFlow is a personal tracking tool, not financial advice.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-forest hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
