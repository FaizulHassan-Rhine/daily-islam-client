import { cn } from "@/lib/cn";

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "bg-primary text-white dark:text-background hover:opacity-95",
    secondary: "bg-primary-soft text-primary hover:bg-primary-soft/80",
    ghost: "bg-transparent text-foreground hover:bg-primary-soft/60",
    gold: "bg-gold text-background hover:opacity-95",
  };
  const sizes = {
    sm: "h-10 px-3 text-sm",
    md: "h-12 px-4 text-sm",
    lg: "h-14 px-5 text-base",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition touch-target disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
