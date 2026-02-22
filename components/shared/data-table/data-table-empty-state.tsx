import { FileX } from "lucide-react";

interface DataTableEmptyStateProps {
  message?: string;
}

export function DataTableEmptyState({
  message = "No data found.",
}: DataTableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <FileX className="h-10 w-10 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
