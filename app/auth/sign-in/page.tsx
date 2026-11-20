import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; signedOut?: string }>;
}) {
  const params = await searchParams;

  return (
    <SignInForm
      deleted={params.deleted === "1"}
      signedOut={params.signedOut === "1"}
    />
  );
}
