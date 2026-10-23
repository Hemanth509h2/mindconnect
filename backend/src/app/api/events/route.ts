import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { eventSummarySelect, toSummary } from "@/lib/events";

/**
 * Published events. Query params (all optional):
 * q, type, mode, topic, price=free|paid, when=upcoming|past, page, pageSize.
 * "upcoming" includes events that are on right now.
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const q = sp.get("q")?.trim();
  const type = sp.get("type");
  const mode = sp.get("mode");
  const topic = sp.get("topic");
  const price = sp.get("price");
  const past = sp.get("when") === "past";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize")) || 12));
  const now = new Date();

  const where: Prisma.EventWhereInput = {
    status: "PUBLISHED",
    endsAt: past ? { lt: now } : { gte: now },
    ...(q && {
      OR: [
        { title: { contains: q } },
        { tagline: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
      ],
    }),
    ...(type && { type }),
    ...(mode && { mode }),
    ...(topic && { topics: { contains: topic } }),
    ...(price === "free" && { price: 0 }),
    ...(price === "paid" && { price: { gt: 0 } }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startsAt: past ? "desc" : "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: eventSummarySelect,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    events: events.map(toSummary),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
