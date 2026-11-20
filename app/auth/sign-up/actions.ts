"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type SignUpState = { error?: string } | null;

export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2) {
    return { error: "Tell us your name (at least 2 characters)." };
  }

  if (!email) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password." };
  }

  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  const { error } = await auth.signUp.email({ name, email, password });

  if (error) {
    return {
      error: error.message ?? "We could not create your account.",
    };
  }

  redirect("/dashboard");
}
