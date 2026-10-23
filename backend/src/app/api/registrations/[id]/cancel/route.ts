import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { fail } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const registration = await prisma.registration.findFirst({
    where: { id: (await params).id, userId: auth.user.id },
  });
  if (!registration) return fail("Registration not found", 404);

  const updated = await prisma.registration.update({
    where: { id: registration.id },
    data: { status: "CANCELLED" },
    select: { id: true, status: true },
  });
  return NextResponse.json(updated);
}
