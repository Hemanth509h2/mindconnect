import { prisma } from "@/lib/db";
import { fail } from "@/lib/http";

/** An uploaded image's bytes. Images never change, so they can be cached forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const image = await prisma.image.findUnique({
    where: { id: (await params).id },
    select: { data: true, contentType: true },
  });
  if (!image) return fail("Image not found", 404);

  return new Response(Buffer.from(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
