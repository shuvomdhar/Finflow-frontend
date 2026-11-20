"use client";

import Link from "next/link";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { useActionState } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { FormAlert, Input, Label } from "@/components/ui/field";
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<
    ForgotPasswordState,
    FormData
  >(forgotPasswordAction, null);

  return (
    <div className="animate-rise">
      <AuthHeader
        title="Forgot your password?"
        description="Enter your account email and we will send you a secure reset link."
      />

      {state?.success ? (
        <div className="rounded-xl border border-emerald-200 bg-mint/60 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-forest shadow-sm">
            <MailCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-extrabold text-navy">
            Check your inbox
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-forest/80">
            {state.success}
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-forest hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
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

          {state?.error ? <FormAlert>{state.error}</FormAlert> : null}

          <Button type="submit" size="lg" className="w-full" loading={pending}>
            {pending ? "Sending link…" : "Send reset link"}
            {!pending ? <Send className="h-4 w-4" /> : null}
          </Button>

          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center gap-1.5 pt-1 text-sm font-medium text-muted hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}
