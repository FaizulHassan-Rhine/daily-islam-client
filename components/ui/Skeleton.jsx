export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse-soft rounded-2xl bg-primary-soft/70 dark:bg-surface-secondary ${className}`} />;
}

export function HomeSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-card-lg" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-48" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
