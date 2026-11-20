"use server";

import { auth } from "@/lib/auth/server";

export type ChangePasswordState = {
  error?: string;
  success?: string;
} | null;

export async function changePasswordAction(
  _previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return { error: "Enter your current password." };
  }

  if (newPassword.length < 8) {
    return { error: "Use at least 8 characters for your new password." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "The new passwords do not match." };
  }

  if (newPassword === currentPassword) {
    return { error: "Choose a password different from your current one." };
  }

  const { error } = await auth.changePassword({
    currentPassword,
    newPassword,
    revokeOtherSessions: true,
  });

  if (error) {
    return {
      error:
        error.message ??
        "We could not update your password. Check your current password.",
    };
  }

  return { success: "Password updated. Other devices have been signed out." };
}
