export function Card({ children, className = "", as: Tag = "section", ...props }) {
  return (
    <Tag
      className={`rounded-card-lg border border-border bg-surface p-4 shadow-card dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, action, subtitle }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-muted">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
