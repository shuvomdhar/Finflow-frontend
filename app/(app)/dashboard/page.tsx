import type { Metadata } from "next";
import { auth } from "@/lib/auth/server";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return <DashboardClient firstName={firstName} />;
}
