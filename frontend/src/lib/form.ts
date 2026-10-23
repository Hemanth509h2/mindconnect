export type FormState = { error?: string; ok?: boolean; message?: string };

export function str(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
