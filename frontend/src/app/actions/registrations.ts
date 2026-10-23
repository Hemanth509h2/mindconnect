"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, attempt } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { str, type FormState } from "@/lib/form";

export async function registerForEvent(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await getCurrentUser())) redirect(`/login?next=${encodeURIComponent(`/events/${slug}`)}`);

  const result = await attempt(() =>
    api(`/api/events/${encodeURIComponent(slug)}/register`, {
      method: "POST",
      body: {
        name: str(formData, "name"),
        email: str(formData, "email"),
        phone: str(formData, "phone"),
        organization: str(formData, "organization"),
        note: str(formData, "note"),
        consent: formData.get("consent") === "on",
      },
    }),
  );
  if ("error" in result) return { error: result.error };
  revalidatePath(`/events/${slug}`);
  return { ok: true };
}

export async function cancelRegistration(registrationId: string, slug: string) {
  await api(`/api/registrations/${registrationId}/cancel`, { method: "POST" });
  revalidatePath("/dashboard");
  revalidatePath(`/events/${slug}`);
}
