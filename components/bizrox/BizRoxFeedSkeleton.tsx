export function PostCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "white", border: "1px solid #E5E7EB" }}
    >
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-36 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-100 shrink-0" />
      </div>
      <div className="px-5 pb-4 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="px-5 pb-5">
        <div className="h-40 rounded-xl bg-gray-100" />
      </div>
      <div className="flex gap-4 px-5 py-3 border-t border-gray-100">
        <div className="h-4 bg-gray-100 rounded w-12" />
        <div className="h-4 bg-gray-100 rounded w-16" />
        <div className="h-4 bg-gray-100 rounded w-14" />
      </div>
    </div>
  );
}

export default function BizRoxFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
