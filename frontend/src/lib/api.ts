import { cookies } from "next/headers";

/**
 * Base URL of the backend API. Only the Next.js server talks to it: pages and
 * server actions call `api()`, which forwards the user's session token as
 * `Authorization: Bearer <token>`.
 */
export const API_URL = (process.env.API_URL || "http://localhost:4200").replace(/\/+$/, "");

export const SESSION_COOKIE = "mc_session";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown };

async function request(path: string, { method = "GET", body }: Options = {}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  }
  return res;
}

/** Call the backend and return its JSON. Throws ApiError on a non-2xx response. */
export async function api<T>(path: string, options?: Options): Promise<T> {
  const res = await request(path, options);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** Like api(), but returns the raw response (for file downloads). */
export function apiRaw(path: string) {
  return request(path);
}

/** For pages: null when the backend says 404, so the page can call notFound(). */
export async function apiOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** For server actions: turn the backend's error message into something a form can show. */
export async function attempt<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: string }> {
  try {
    return { data: await fn() };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}
