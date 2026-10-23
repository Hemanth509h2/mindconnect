"use client";

import { useFormStatus } from "react-dom";

/** A submit button that asks for confirmation before submitting its form. */
export function ConfirmButton({
  children,
  message,
  className = "btn-danger btn-sm",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
