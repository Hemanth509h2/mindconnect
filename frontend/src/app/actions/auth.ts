"use server";

import { redirect } from "next/navigation";
import { api, attempt } from "@/lib/api";
import { clearSession, safeNext, setSession } from "@/lib/auth";
import { str, type FormState } from "@/lib/form";
import type { User } from "@/lib/types";

type AuthResponse = { token: string; user: User };

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const role = str(formData, "role") || "PARTICIPANT";
  const result = await attempt(() =>
    api<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: {
        name: str(formData, "name"),
        email: str(formData, "email"),
        password: String(formData.get("password") ?? ""),
        role,
        orgName: role === "ORGANIZER" ? str(formData, "orgName") : undefined,
      },
    }),
  );
  if ("error" in result) return { error: result.error };
  await setSession(result.data.token);
  redirect(safeNext(formData.get("next"), role === "ORGANIZER" ? "/organizer" : "/events"));
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await attempt(() =>
    api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email: str(formData, "email"), password: String(formData.get("password") ?? "") },
    }),
  );
  if ("error" in result) return { error: result.error };
  await setSession(result.data.token);
  redirect(safeNext(formData.get("next"), result.data.user.role === "PARTICIPANT" ? "/dashboard" : "/organizer"));
}

export async function logout() {
  await clearSession();
  redirect("/");
}
