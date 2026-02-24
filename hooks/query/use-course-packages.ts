import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getCoursePackages } from "@/lib/api/course-packages";

export function useCoursePackages() {
  return useQuery({
    queryKey: queryKeys.coursePackages.lists(),
    queryFn: getCoursePackages,
  });
}
