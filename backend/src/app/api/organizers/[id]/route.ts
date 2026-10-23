import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { eventSummarySelect, toSummary } from "@/lib/events";
import { fail } from "@/lib/http";

/** Public organizer profile with their published events. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const organizer = await prisma.user.findUnique({
    where: { id: (await params).id },
    select: {
      id: true,
      name: true,
      orgName: true,
      bio: true,
      website: true,
      events: { where: { status: "PUBLISHED" }, orderBy: { startsAt: "desc" }, select: eventSummarySelect },
    },
  });
  if (!organizer || organizer.events.length === 0) return fail("Organizer not found", 404);
  return NextResponse.json({ ...organizer, events: organizer.events.map(toSummary) });
}
