/** Streaming placeholder for the journal index. */
export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="skeleton h-3 w-20 rounded-full" />
      <div className="skeleton h-9 w-64 rounded-2xl mt-3" />
      <div className="skeleton aspect-[16/7] w-full rounded-3xl mt-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-line overflow-hidden">
            <div className="skeleton aspect-[16/10]" />
            <div className="p-5 space-y-3">
              <div className="skeleton h-3 w-16 rounded-full" />
              <div className="skeleton h-4 w-full rounded-full" />
              <div className="skeleton h-3 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
