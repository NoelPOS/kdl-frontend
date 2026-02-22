import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAllClassOptions } from "@/lib/api/class-options";

/**
 * Fetches all class options (course types like Fixed, Camp, Check).
 * These rarely change — cache aggressively.
 */
export function useClassOptionList() {
  return useQuery({
    queryKey: queryKeys.classOptions.list(),
    queryFn: () => getAllClassOptions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
