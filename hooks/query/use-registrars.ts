import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getRegistrars,
  getRegistrarById,
  type RegistrarListFilters,
} from "@/lib/api/registrars";

/**
 * Fetches the filtered + paginated registrar list.
 */
export function useRegistrarList(filters: RegistrarListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.registrars.list(filters as Record<string, unknown>),
    queryFn: () => getRegistrars(filters),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Fetches a single registrar by ID.
 */
export function useRegistrarDetail(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.registrars.detail(String(id)),
    queryFn: () => getRegistrarById(id!),
    enabled: id != null,
    staleTime: 60 * 1000,
  });
}
