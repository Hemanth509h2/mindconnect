import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { publicUserSelect, signToken } from "@/lib/auth";
import { fail, readJson } from "@/lib/http";

const loginSchema = z.object({ email: z.string().trim().toLowerCase(), password: z.string() });

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail("Enter your email and password");
  const { email, password } = parsed.data;

  const found = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
    return fail("Wrong email or password", 401);
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: found.id }, select: publicUserSelect });
  return NextResponse.json({ token: await signToken(user.id), user });
}
