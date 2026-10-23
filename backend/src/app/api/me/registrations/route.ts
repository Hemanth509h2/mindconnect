import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { eventSummarySelect, toSummary } from "@/lib/events";

/** The logged-in user's registrations, newest event first, with meeting links for active ones. */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const registrations = await prisma.registration.findMany({
    where: { userId: auth.user.id },
    orderBy: { event: { startsAt: "desc" } },
    select: {
      id: true,
      status: true,
      createdAt: true,
      event: { select: { ...eventSummarySelect, meetingLink: true } },
    },
  });

  return NextResponse.json(
    registrations.map(({ event: { meetingLink, ...event }, ...registration }) => ({
      ...registration,
      event: {
        ...toSummary(event),
        meetingLink: registration.status === "REGISTERED" && event.status === "PUBLISHED" ? meetingLink : null,
      },
    })),
  );
}
