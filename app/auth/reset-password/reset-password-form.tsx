"use client";

import { KeyRound } from "lucide-react";
import { useActionState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { FormAlert, Label } from "@/components/ui/field";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "./actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPasswordAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="password" hint="8+ characters">
          New password
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
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
          required
        />
      </div>

      {state?.error ? <FormAlert>{state.error}</FormAlert> : null}

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        {pending ? "Updating password…" : "Update password"}
        {!pending ? <KeyRound className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
