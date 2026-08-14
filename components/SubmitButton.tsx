"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type SubmitButtonProps = {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  className = "btn-primary",
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-80`}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          <span aria-live="polite" role="status">
            {pendingLabel ?? children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
