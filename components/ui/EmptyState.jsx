export function EmptyState({ title, body, action, className = "" }) {
  return (
    <div className={`rounded-card-lg border border-dashed border-border bg-surface-warm px-4 py-10 text-center ${className}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      {body ? <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, body, onRetry, retryLabel = "Try again" }) {
  return (
    <EmptyState
      title={title}
      body={body}
      action={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white dark:text-background"
          >
            {retryLabel}
          </button>
        ) : null
      }
    />
  );
}
