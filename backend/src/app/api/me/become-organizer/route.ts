import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { publicUserSelect, requireAuth } from "@/lib/auth";
import { readJson, zodFail } from "@/lib/http";

const schema = z.object({
  orgName: z.string().trim().min(2, "Enter the name of your organisation or practice").max(120),
});

/** Let a participant start hosting events. */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return zodFail(parsed.error);

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: { role: auth.user.role === "ADMIN" ? "ADMIN" : "ORGANIZER", orgName: parsed.data.orgName },
    select: publicUserSelect,
  });
  return NextResponse.json(user);
}
