"use client";

import { useFormStatus } from "react-dom";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean; pendingText?: string };

/** Disables itself while its form is submitting. Pass `pending` when the form uses useActionForm. */
export function SubmitButton({ children, pending, pendingText, className = "btn-primary", ...rest }: Props) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;
  return (
    <button type="submit" disabled={busy} className={className} {...rest}>
      {busy ? (pendingText ?? "Please wait…") : children}
    </button>
  );
}
