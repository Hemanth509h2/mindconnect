import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrganizer } from "@/lib/auth";
import { parseEventInput, toDetail } from "@/lib/events";
import { fail, readJson } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

async function ownEvent(request: Request, params: Params["params"]) {
  const auth = await requireOrganizer(request);
  if (!auth.ok) return auth;
  const event = await prisma.event.findFirst({
    where: { id: (await params).id, organizerId: auth.user.id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) return { ok: false as const, response: fail("Event not found", 404) };
  return { ok: true as const, event };
}

export async function GET(request: Request, { params }: Params) {
  const own = await ownEvent(request, params);
  if (!own.ok) return own.response;
  const { _count, ...event } = own.event;
  return NextResponse.json({ ...toDetail(event, true), registrationCount: _count.registrations });
}

export async function PUT(request: Request, { params }: Params) {
  const own = await ownEvent(request, params);
  if (!own.ok) return own.response;

  const input = parseEventInput(await readJson(request));
  if ("error" in input) return fail(input.error!);

  const event = await prisma.event.update({
    where: { id: own.event.id },
    data: { ...input.data, ...(input.status && { status: input.status }) },
    select: { id: true, slug: true, status: true },
  });
  return NextResponse.json(event);
}

/** Only drafts nobody has registered for can be deleted; anything else should be cancelled. */
export async function DELETE(request: Request, { params }: Params) {
  const own = await ownEvent(request, params);
  if (!own.ok) return own.response;
  if (own.event.status !== "DRAFT" || own.event._count.registrations > 0) {
    return fail("Only drafts without registrations can be deleted. Cancel the event instead.", 409);
  }
  await prisma.event.delete({ where: { id: own.event.id } });
  return new NextResponse(null, { status: 204 });
}
