"use client";

import { supabase } from "@/lib/supabase-client";

/**
 * fetch() for community write actions.
 *
 * The API accepts the session cookie, but sending the bearer token as well
 * keeps joins, posts and comments working when the cookie is missing (for
 * example right after sign-in, before it is refreshed).
 */
export async function communityFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  } catch {
    // Fall back to cookie auth.
  }
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}

/** Reads `{ error }` from a failed response without throwing on non-JSON bodies. */
export async function errorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  if (res.status === 401) return "Please sign in again to continue.";
  if (res.status === 429) return "You're doing that too often. Please wait a moment and try again.";
  return (data && typeof data.error === "string" && data.error) || fallback;
}
