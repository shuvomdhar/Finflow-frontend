"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type ResetPasswordState = { error?: string } | null;

export async function resetPasswordAction(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return {
      error: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  if (password.length < 8) {
    return { error: "Use at least 8 characters for your new password." };
  }

  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  const { error } = await auth.resetPassword({
    newPassword: password,
    token,
  });

  if (error) {
    return {
      error:
        error.message ??
        "We could not reset your password. The link may have expired.",
    };
  }

  redirect("/auth/sign-in");
}
