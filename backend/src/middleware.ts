import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * The frontend is deployed separately, so API responses carry CORS headers.
 * Authenticated requests send `Authorization: Bearer <token>`; no cookies.
 */
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
  }
  const response = NextResponse.next();
  for (const [k, v] of Object.entries(corsHeaders(request))) {
    response.headers.set(k, v);
  }
  return response;
}

// Comma-separated, e.g. "https://mindconnect.in,http://localhost:3200".
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
);

function corsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  return {
    ...(ALLOWED_ORIGINS.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export const config = {
  matcher: "/api/:path*",
};
