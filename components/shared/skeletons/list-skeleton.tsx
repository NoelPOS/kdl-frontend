import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * Generic animated skeleton for list/table loading states.
 * Use while TanStack Query is fetching initial data.
 */
export function ListSkeleton({ rows = 10, className }: ListSkeletonProps) {
  return (
    <div
      className={cn("space-y-2", className)}
      data-testid="list-skeleton"
      aria-label="Loading..."
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-md bg-muted animate-pulse"
          style={{ opacity: 1 - i * (0.06) }} // subtle fade for visual depth
        />
      ))}
    </div>
  );
}
