"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}) {
  return (
    <span className={cn("relative inline-flex h-11 w-11 shrink-0 items-center justify-center", className)}>
      <input
        type="checkbox"
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...(checked !== undefined ? { checked } : { defaultChecked })}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-[6px] border border-border bg-surface text-white transition",
          "peer-hover:border-primary/45",
          "peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/35 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          "peer-disabled:opacity-40",
          "dark:text-background"
        )}
      >
        <Check size={13} strokeWidth={2.75} className="scale-75 opacity-0 transition" />
      </span>
    </span>
  );
}
