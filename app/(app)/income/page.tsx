import type { Metadata } from "next";
import { IncomeClient } from "./income-client";

export const metadata: Metadata = { title: "Income" };

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const params = await searchParams;
  return <IncomeClient initialNew={params.new === "1"} />;
}
