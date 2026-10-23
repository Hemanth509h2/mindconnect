import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { api, ApiError, SESSION_COOKIE } from "./api";
import type { User } from "./types";

// Matches the backend's token lifetime.
const MAX_AGE = 60 * 60 * 24 * 30;

export async function setSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The logged-in user, or null when there's no session or it has expired. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await cookies()).get(SESSION_COOKIE)) return null;
  try {
    return await api<User>("/api/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
});

export function isOrganizer(user: { role: string } | null) {
  return user?.role === "ORGANIZER" || user?.role === "ADMIN";
}

/** Only allow redirects to paths on this site ("//x" and "/\\x" would leave it). */
export function safeNext(next: unknown, fallback = "/") {
  return typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : fallback;
}

export async function requireUser(next = "/") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireOrganizer() {
  const user = await requireUser("/organizer");
  if (!isOrganizer(user)) redirect("/dashboard#host");
  return user;
}
