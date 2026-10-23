import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrganizer } from "@/lib/auth";
import { eventSummarySelect, parseEventInput, slugify, toSummary } from "@/lib/events";
import { fail, readJson } from "@/lib/http";

/** The organizer's own events, every status, newest first. */
export async function GET(request: Request) {
  const auth = await requireOrganizer(request);
  if (!auth.ok) return auth.response;

  const events = await prisma.event.findMany({
    where: { organizerId: auth.user.id },
    orderBy: { startsAt: "desc" },
    select: eventSummarySelect,
  });
  return NextResponse.json(events.map(toSummary));
}

export async function POST(request: Request) {
  const auth = await requireOrganizer(request);
  if (!auth.ok) return auth.response;

  const input = parseEventInput(await readJson(request));
  if ("error" in input) return fail(input.error!);

  const event = await prisma.event.create({
    data: { ...input.data, slug: slugify(input.data.title), status: input.status ?? "DRAFT", organizerId: auth.user.id },
    select: { id: true, slug: true, status: true },
  });
  return NextResponse.json(event, { status: 201 });
}
