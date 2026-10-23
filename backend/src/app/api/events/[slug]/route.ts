import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { toDetail } from "@/lib/events";
import { fail } from "@/lib/http";

/**
 * One event by slug. Drafts are only visible to their organizer. The meeting
 * link is only sent to the organizer and to registered participants.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, user] = await Promise.all([
    prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: { select: { id: true, name: true, orgName: true, bio: true, website: true } },
        _count: { select: { registrations: { where: { status: "REGISTERED" } } } },
      },
    }),
    getAuthUser(request),
  ]);
  const isOwner = !!user && event?.organizerId === user.id;
  if (!event || (event.status === "DRAFT" && !isOwner)) return fail("Event not found", 404);

  const myRegistration = user
    ? await prisma.registration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: user.id } },
        select: { id: true, status: true, createdAt: true },
      })
    : null;

  const { organizer, _count, ...rest } = event;
  return NextResponse.json({
    ...toDetail(rest, isOwner || myRegistration?.status === "REGISTERED"),
    organizer,
    registeredCount: _count.registrations,
    isOwner,
    myRegistration,
  });
}
