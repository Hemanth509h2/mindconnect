"use server";

import { api, attempt } from "@/lib/api";

/** Store an image on the backend. Returns the `/images/<id>` path to save on the event. */
export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const result = await attempt(() => api<{ url: string }>("/api/uploads", { method: "POST", body: formData }));
  return "error" in result ? result : result.data;
}
