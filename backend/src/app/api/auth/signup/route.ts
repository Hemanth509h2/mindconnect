import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { publicUserSelect, signToken } from "@/lib/auth";
import { fail, readJson, zodFail } from "@/lib/http";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email").transform((e) => e.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["PARTICIPANT", "ORGANIZER"]).default("PARTICIPANT"),
  orgName: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) return zodFail(parsed.error);
  const { name, email, password, role, orgName } = parsed.data;
  if (role === "ORGANIZER" && !orgName) return fail("Enter the name of your organisation or practice");

  if (await prisma.user.findUnique({ where: { email } })) {
    return fail("An account with this email already exists. Log in instead.", 409);
  }
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      orgName: role === "ORGANIZER" ? orgName : null,
    },
    select: publicUserSelect,
  });
  return NextResponse.json({ token: await signToken(user.id), user }, { status: 201 });
}
