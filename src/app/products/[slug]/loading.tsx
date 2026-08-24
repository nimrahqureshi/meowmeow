/** Streaming placeholder matching the product detail layout — no CLS on swap. */
export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="skeleton h-3 w-64 max-w-full rounded-full" />
      <div className="grid lg:grid-cols-2 gap-10 mt-6">
        <div className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] gap-3">
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-xl" />
            ))}
          </div>
          <div className="skeleton aspect-[4/5] rounded-3xl" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-3 w-28 rounded-full" />
          <div className="skeleton h-8 w-full rounded-2xl" />
          <div className="skeleton h-8 w-3/4 rounded-2xl" />
          <div className="skeleton h-4 w-40 rounded-full" />
          <div className="skeleton h-12 w-48 rounded-2xl mt-6" />
          <div className="skeleton h-12 w-full rounded-2xl" />
          <div className="skeleton h-24 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
