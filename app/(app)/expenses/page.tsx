import type { Metadata } from "next";
import { ExpensesClient } from "./expenses-client";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; search?: string }>;
}) {
  const params = await searchParams;
  return (
    <ExpensesClient
      initialNew={params.new === "1"}
      initialSearch={params.search ?? ""}
    />
  );
}
