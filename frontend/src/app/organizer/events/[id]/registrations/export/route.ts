import { apiRaw, ApiError } from "@/lib/api";

/** Streams the backend's CSV through, so the session token never reaches the browser. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await apiRaw(`/api/organizer/events/${encodeURIComponent(id)}/registrations?format=csv`);
    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "text/csv",
        "Content-Disposition": res.headers.get("Content-Disposition") ?? 'attachment; filename="registrations.csv"',
      },
    });
  } catch (err) {
    if (err instanceof ApiError) return new Response(err.message, { status: err.status });
    throw err;
  }
}
