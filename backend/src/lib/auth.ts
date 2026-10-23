import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import { fail } from "./http";

export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Fields of a user that are safe to send to the client. */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  orgName: true,
  bio: true,
  website: true,
} as const;

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export function signToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(key());
}

/**
 * The user behind the request's `Authorization: Bearer <token>` header, or
 * null when there is no valid token. Looked up fresh so role changes apply at once.
 */
export async function getAuthUser(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    return await prisma.user.findUnique({ where: { id: payload.sub }, select: publicUserSelect });
  } catch {
    return null;
  }
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;

/**
 * Usage inside a route handler:
 *
 *   const auth = await requireAuth(request);
 *   if (!auth.ok) return auth.response;
 *   const { user } = auth;
 */
export async function requireAuth(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return { ok: false as const, response: fail("Please log in", 401) };
  return { ok: true as const, user };
}

export function isOrganizer(user: { role: string }) {
  return user.role === "ORGANIZER" || user.role === "ADMIN";
}

export async function requireOrganizer(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;
  if (!isOrganizer(auth.user)) {
    return { ok: false as const, response: fail("Only organizers can do this", 403) };
  }
  return auth;
}
