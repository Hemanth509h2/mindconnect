import { API_URL } from "@/lib/api";

/**
 * Uploaded images, passed through from the backend so the browser keeps
 * talking only to this site. They never change, so the CDN caches them.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/api/images/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return new Response("Not found", { status: res.status === 404 ? 404 : 502 });
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
