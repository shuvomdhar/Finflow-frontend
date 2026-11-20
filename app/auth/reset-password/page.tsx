import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-header";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <div className="animate-rise">
      <AuthHeader
        title="Choose a new password"
        description="Pick a strong password you have not used before."
      />

      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="font-display text-lg font-extrabold text-navy">
            Link needs refreshing
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-amber-900/80">
            This reset link is missing its token or has expired. Request a new
            link and open the newest email.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-5 inline-flex rounded-lg bg-forest px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-forest-deep"
          >
            Request a new link
          </Link>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-forest hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
