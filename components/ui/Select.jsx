"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className,
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", open && "z-50", className)}>
      <button
        type="button"
        disabled={disabled || !options.length}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface text-left text-sm text-foreground transition",
          "hover:border-primary/50 focus-visible:border-primary disabled:opacity-50",
          size === "sm" ? "h-10 rounded-xl px-3" : "h-12 px-3.5",
          open && "border-primary"
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-muted")}>{selected?.label || placeholder}</span>
        <ChevronDown size={16} className={cn("shrink-0 text-muted transition", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-border bg-surface p-1 shadow-glow"
        >
          {options.map((opt) => {
            const active = String(opt.value) === String(value);
            return (
              <li key={String(opt.value)} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm",
                    active ? "bg-primary-soft font-medium text-primary" : "text-foreground hover:bg-primary-soft/60"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  {active ? <Check size={16} className="shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
