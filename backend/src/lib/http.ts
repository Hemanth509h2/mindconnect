import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** Error response in the shape every client expects: `{ error }`. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function zodFail(err: ZodError) {
  return fail(err.issues[0]?.message ?? "Invalid request");
}

/** The request's JSON body, or null if it isn't valid JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
