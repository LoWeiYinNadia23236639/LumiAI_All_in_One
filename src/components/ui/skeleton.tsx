import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-neutral-200 rounded-lg", className)} />
  );
}

/** Skeleton matching the marketplace campaign card layout. */
export function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-24 flex lg:flex-col items-center gap-2">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <Skeleton className="w-12 h-3" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-16 h-4 rounded-full" />
          </div>
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        </div>
        <div className="lg:w-48 space-y-3">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a simple list row (applications, history, etc.). */
export function ListRowSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-16 h-4 rounded-full" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="w-full h-3" />
      ))}
    </div>
  );
}
