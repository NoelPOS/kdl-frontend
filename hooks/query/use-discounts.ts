import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getDiscounts } from "@/lib/api/discounts";

/**
 * Fetches all discounts.
 * Discounts rarely change so cache for 5 minutes.
 */
export function useDiscountList() {
  return useQuery({
    queryKey: queryKeys.discounts.list(),
    queryFn: () => getDiscounts(),
    staleTime: 5 * 60 * 1000,
  });
}
