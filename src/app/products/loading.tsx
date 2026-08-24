import { SkeletonGrid } from "@/components/ui";

/** Streams instantly while the catalog query runs, so the shell never blanks. */
export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="skeleton h-9 w-72 rounded-2xl mt-3" />
      <div className="skeleton h-4 w-96 max-w-full rounded-full mt-3" />
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 mt-8 items-start">
        <div className="hidden lg:block glass rounded-3xl p-5 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full rounded-xl" />
          ))}
        </div>
        <SkeletonGrid count={9} className="grid grid-cols-2 md:grid-cols-3 gap-4" />
      </div>
    </div>
  );
}
