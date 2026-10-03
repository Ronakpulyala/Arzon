export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-6 w-40 rounded bg-ink-100" />
        <div className="h-4 w-72 rounded bg-ink-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border border-ink-100 bg-surface-card" />
        ))}
      </div>
      <div className="h-64 rounded-lg border border-ink-100 bg-surface-card" />
    </div>
  );
}
