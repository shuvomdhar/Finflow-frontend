"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

export type ForgotPasswordState = {
  error?: string;
  success?: string;
} | null;

export async function forgotPasswordAction(
  _previousState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Enter the email address linked to your account." };
  }

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? null;
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  // On Vercel the request host is the real deployment domain, so this keeps
  // the reset link on the deployed site without another env variable.
  const origin =
    configured ?? (host ? `${proto}://${host}` : "http://localhost:3000");

  const { error } = await auth.requestPasswordReset({
    email,
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return {
      error:
        error.message ??
        "We could not send the reset email. Please try again shortly.",
    };
  }

  return {
    success:
      "If an account exists for that email, a password reset link is on its way. The link expires in 15 minutes.",
  };
}
