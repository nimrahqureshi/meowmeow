import { SkeletonCard } from "@/components/ui";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-8">
      <div className="skeleton h-10 w-64 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
