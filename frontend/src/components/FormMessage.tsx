import type { FormState } from "@/lib/form";

export function FormMessage({ state }: { state: FormState }) {
  if (state.error) return <p role="alert" className="alert-error">{state.error}</p>;
  if (state.ok && state.message) return <p role="status" className="alert-success">{state.message}</p>;
  return null;
}
