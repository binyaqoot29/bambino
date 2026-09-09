/**
 * Shown the instant a link is clicked, while the page's data is on its way.
 * The shapes match the pages: a title, a line, then cards. Nothing spins.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <div className="bg-ink-200/70 h-9 w-48 rounded-lg" />
      <div className="bg-ink-200/50 mt-3 h-4 w-72 rounded" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-card h-28 bg-white shadow-[var(--shadow-soft)]"
          />
        ))}
      </div>
      <div className="rounded-card mt-6 h-72 bg-white shadow-[var(--shadow-soft)]" />
    </div>
  );
}
