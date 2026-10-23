import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { publicUserSelect, requireAuth } from "@/lib/auth";
import { phoneSchema } from "@/lib/events";
import { readJson, zodFail } from "@/lib/http";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(auth.user);
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.union([z.literal(""), phoneSchema]).optional(),
  orgName: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  website: z.union([z.literal(""), z.url({ protocol: /^https?$/, message: "Enter a full link starting with https://" })]).optional(),
});

export async function PATCH(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const parsed = profileSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      name: v.name,
      phone: v.phone || null,
      orgName: v.orgName || null,
      bio: v.bio || null,
      website: v.website || null,
    },
    select: publicUserSelect,
  });
  return NextResponse.json(user);
}
