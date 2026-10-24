import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrganizer } from "@/lib/auth";
import { fail } from "@/lib/http";

// Images live in Postgres, so keep them small. The frontend shrinks photos before uploading.
const MAX_BYTES = 3 * 1024 * 1024;

// The file's first bytes, so a renamed non-image can't get through.
const SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/gif": (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46,
  "image/webp": (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
};

function ascii(b: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...b.subarray(start, end));
}

/**
 * Upload one image as multipart form data (field `file`). Returns `{ url }`,
 * a path like `/images/<id>` that the frontend serves and events store.
 */
export async function POST(request: Request) {
  const auth = await requireOrganizer(request);
  if (!auth.ok) return auth.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("Choose an image to upload");
  if (file.size > MAX_BYTES) return fail("Images must be 3 MB or smaller");

  const check = SIGNATURES[file.type];
  const data = new Uint8Array(await file.arrayBuffer());
  if (!check || !check(data)) return fail("Upload a JPEG, PNG, WebP or GIF image");

  const image = await prisma.image.create({
    data: { data, contentType: file.type, size: data.length, uploaderId: auth.user.id },
    select: { id: true },
  });
  return NextResponse.json({ url: `/images/${image.id}` }, { status: 201 });
}
