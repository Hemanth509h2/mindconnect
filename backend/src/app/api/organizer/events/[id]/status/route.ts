import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrganizer } from "@/lib/auth";
import { statusSchema } from "@/lib/events";
import { fail, readJson, zodFail } from "@/lib/http";

/** Publish, unpublish (back to draft) or cancel an event. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizer(request);
  if (!auth.ok) return auth.response;
  const parsed = statusSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodFail(parsed.error);

  const event = await prisma.event.findFirst({ where: { id: (await params).id, organizerId: auth.user.id } });
  if (!event) return fail("Event not found", 404);

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: { status: parsed.data.status },
    select: { id: true, slug: true, status: true },
  });
  return NextResponse.json(updated);
}
