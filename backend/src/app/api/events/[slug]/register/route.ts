import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { phoneSchema } from "@/lib/events";
import { fail, readJson, zodFail } from "@/lib/http";

const registrationSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email"),
  phone: phoneSchema,
  organization: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
  consent: z.literal(true, { message: "Please agree to share your details with the organizer" }),
});

class RegistrationRefused extends Error {}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const parsed = registrationSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;

  const event = await prisma.event.findUnique({ where: { slug: (await params).slug } });
  if (!event) return fail("Event not found", 404);
  if (event.status !== "PUBLISHED") return fail("This event is not open for registration");
  if (event.registrationDeadline <= new Date()) return fail("Registration for this event has closed");

  const details = {
    name: v.name,
    email: v.email,
    phone: v.phone,
    organization: v.organization || null,
    note: v.note || null,
  };
  // Count seats and register in one serializable transaction so two people
  // can't both take the last seat. When requests race, Postgres aborts one of
  // them (P2034, or P2002 for a double-submit); the retry then sees the winner.
  let registration;
  for (let attempt = 1; ; attempt++) {
    try {
      registration = await prisma.$transaction(
        async (tx) => {
          const where = { eventId_userId: { eventId: event.id, userId: user.id } };
          const existing = await tx.registration.findUnique({ where });
          if (existing?.status === "REGISTERED") throw new RegistrationRefused("You're already registered for this event");
          if (event.capacity !== null) {
            const taken = await tx.registration.count({ where: { eventId: event.id, status: "REGISTERED" } });
            if (taken >= event.capacity) throw new RegistrationRefused("Sorry, this event is full");
          }
          return tx.registration.upsert({
            where,
            create: { ...details, eventId: event.id, userId: user.id },
            update: { ...details, status: "REGISTERED" },
            select: { id: true, status: true, createdAt: true },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      break;
    } catch (err) {
      if (err instanceof RegistrationRefused) return fail(err.message, 409);
      const raced = err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2034" || err.code === "P2002");
      if (raced && attempt < 3) continue;
      throw err;
    }
  }

  // Remember the phone number for next time.
  if (!user.phone) await prisma.user.update({ where: { id: user.id }, data: { phone: v.phone } });

  return NextResponse.json(registration, { status: 201 });
}
