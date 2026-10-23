"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/form";

/**
 * useActionState for forms that should keep what the user typed when the
 * server returns an error. (A plain `<form action>` is reset by React after
 * every submit.) The clicked button's name/value is included in the data.
 */
export function useActionForm(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const formData = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  };
  return { state, pending, onSubmit };
}
