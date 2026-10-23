import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrganizer } from "@/lib/auth";
import { fail } from "@/lib/http";

/** Everyone who registered for one of the organizer's events. `?format=csv` downloads a spreadsheet. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOrganizer(request);
  if (!auth.ok) return auth.response;

  const event = await prisma.event.findFirst({
    where: { id: (await params).id, organizerId: auth.user.id },
    select: { id: true, slug: true, title: true, capacity: true },
  });
  if (!event) return fail("Event not found", 404);

  const registrations = await prisma.registration.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, phone: true, organization: true, note: true, status: true, createdAt: true },
  });

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const header = ["Name", "Email", "Phone", "Organisation", "Note", "Status", "Registered at"];
    const rows = registrations.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.organization ?? "",
      r.note ?? "",
      r.status,
      r.createdAt.toISOString(),
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.slug}-registrations.csv"`,
      },
    });
  }

  return NextResponse.json({ event, registrations });
}

// Quote every cell, and defuse values a spreadsheet would run as a formula.
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
