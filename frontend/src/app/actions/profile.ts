"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, attempt } from "@/lib/api";
import { str, type FormState } from "@/lib/form";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await attempt(() =>
    api("/api/me", {
      method: "PATCH",
      body: {
        name: str(formData, "name"),
        phone: str(formData, "phone"),
        orgName: str(formData, "orgName"),
        bio: str(formData, "bio"),
        website: str(formData, "website"),
      },
    }),
  );
  if ("error" in result) return { error: result.error };
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved" };
}

/** Let a participant start hosting events. */
export async function becomeOrganizer(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await attempt(() =>
    api("/api/me/become-organizer", { method: "POST", body: { orgName: str(formData, "orgName") } }),
  );
  if ("error" in result) return { error: result.error };
  redirect("/organizer");
}
