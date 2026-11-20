"use client";

import { clearAccessToken, getAccessToken } from "@/lib/auth/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function authorizedFetch(
  path: string,
  init: RequestInit = {},
  allowRetry = true,
): Promise<Response> {
  const token = await getAccessToken();

  if (!token) {
    throw new ApiError(401, "Your session expired. Please sign in again.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && allowRetry) {
    clearAccessToken();
    return authorizedFetch(path, init, false);
  }

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // Keep the generic message for non-JSON errors.
    }
    throw new ApiError(response.status, message);
  }

  return response;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await authorizedFetch(path, init);
  return (await response.json()) as T;
}

export async function downloadReportPdf(
  year: number,
  month?: string | null,
  currency?: string,
): Promise<void> {
  const params = new URLSearchParams({ year: String(year) });
  if (month) params.set("month", month);
  if (currency) params.set("currency", currency);

  const response = await authorizedFetch(`/api/export/pdf?${params.toString()}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = month
    ? `finflow-report-${month}.pdf`
    : `finflow-report-${year}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
