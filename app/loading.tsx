export default function Loading() {
  return (
    <div className="page-shell min-h-[70svh]" role="status" aria-label="Loading page">
      <p className="eyebrow mb-8">Loading the next page</p>
      <div aria-hidden="true" className="space-y-6">
        <div className="skeleton h-16 w-3/4 max-w-xl" />
        <div className="skeleton h-5 w-full max-w-lg" />
        <div className="skeleton h-5 w-2/3 max-w-md" />
        <div className="skeleton mt-16 h-64 w-full" />
      </div>
    </div>
  );
}
