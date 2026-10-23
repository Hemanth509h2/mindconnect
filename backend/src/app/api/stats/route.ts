import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [events, organizers, registrations] = await Promise.all([
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { events: { some: { status: "PUBLISHED" } } } }),
    prisma.registration.count({ where: { status: "REGISTERED" } }),
  ]);
  return NextResponse.json({ events, organizers, registrations });
}
