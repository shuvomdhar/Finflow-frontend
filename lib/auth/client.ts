"use client";

import { createAuthClient } from "@neon/auth/next";

export const authClient = createAuthClient();

const TOKEN_ENDPOINT = "/api/auth/token";
const FALLBACK_TTL_MS = 10 * 60 * 1000;

let cached: { token: string; expiresAt: number } | null = null;

function isJwt(token: string): boolean {
  return token.split(".").length === 3;
}

function jwtExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof decoded.exp === "number"
      ? decoded.exp * 1000
      : Date.now() + FALLBACK_TTL_MS;
  } catch {
    return Date.now() + FALLBACK_TTL_MS;
  }
}

function remember(token: string): string {
  cached = { token, expiresAt: jwtExpiry(token) };
  return token;
}

/** Clears the cached JWT so the next request fetches a fresh one. */
export function clearAccessToken(): void {
  cached = null;
}

/**
 * Returns a short-lived Neon Auth JWT for the Express API.
 *
 * The Better Auth session token is not a JWT, so asking the Neon Auth `/token`
 * endpoint is the reliable way to get the signed token the backend verifies
 * against the JWKS. Tokens are cached until shortly before they expire.
 */
export async function getAccessToken(): Promise<string | null> {
  if (cached && cached.expiresAt - 60_000 > Date.now()) {
    return cached.token;
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      cached = null;
      return null;
    }

    const body = (await response.json()) as { token?: string };
    if (typeof body.token !== "string" || !isJwt(body.token)) {
      cached = null;
      return null;
    }

    return remember(body.token);
  } catch {
    cached = null;
    return null;
  }
}
