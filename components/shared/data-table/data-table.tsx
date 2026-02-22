"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListSkeleton } from "@/components/shared/skeletons/list-skeleton";
import { DataTableEmptyState } from "./data-table-empty-state";
import { ErrorState } from "@/components/shared/error-state/error-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  /** Unique key — used as the React key. Can be a keyof T or an arbitrary string. */
  key: string;
  header: string;
  /** Optional class applied to both <th> and <td> for this column. */
  className?: string;
  /** Custom cell renderer. Falls back to String(row[key]) when omitted. */
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Called with the row object to derive the React key. */
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  /** Optional extra column added at the far right (e.g., action buttons). */
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Applied to the wrapping <div> of the table. */
  className?: string;
  /** Applied to each <TableCell>. Defaults to the project border style. */
  cellClassName?: string;
}

const DEFAULT_CELL_CLS =
  "border-2 border-gray-300 h-16 text-center whitespace-normal px-3";
const DEFAULT_HEAD_CLS =
  "border-2 border-gray-300 h-16 text-center whitespace-normal font-semibold";

/** Generic bordered data table that matches the existing project table style. */
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  isError,
  errorMessage,
  emptyMessage,
  onRetry,
  rowActions,
  onRowClick,
  className,
  cellClassName,
}: DataTableProps<T>) {
  if (isLoading) return <ListSkeleton rows={8} />;
  if (isError) return <ErrorState message={errorMessage} onRetry={onRetry} />;
  if (!data.length) return <DataTableEmptyState message={emptyMessage} />;

  const cellCls = cellClassName ?? DEFAULT_CELL_CLS;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <Table className="bg-white table-fixed rounded-2xl w-full">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(DEFAULT_HEAD_CLS, col.className)}
              >
                {col.header}
              </TableHead>
            ))}
            {rowActions && (
              <TableHead className={DEFAULT_HEAD_CLS}>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={cn(cellCls, col.className)}>
                  {col.render
                    ? col.render(row, index)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell
                  className={cellCls}
                  onClick={(e) => e.stopPropagation()}
                >
                  {rowActions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
