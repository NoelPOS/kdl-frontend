import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getInvoices,
  getInvoiceById,
  type InvoiceFilter,
} from "@/lib/api/invoices";

export interface InvoiceListFilters extends InvoiceFilter {
  page?: number;
  limit?: number;
}

/**
 * Fetches the filtered + paginated invoice list.
 */
export function useInvoiceList(filters: InvoiceListFilters = {}) {
  const { page = 1, limit = 10, ...filter } = filters;
  return useQuery({
    queryKey: queryKeys.invoices.list(filters as Record<string, unknown>),
    queryFn: () => getInvoices(filter, page, limit),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single invoice by ID.
 */
export function useInvoiceDetail(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(String(id)),
    queryFn: () => getInvoiceById(id!),
    enabled: id != null,
    staleTime: 60 * 1000,
  });
}
