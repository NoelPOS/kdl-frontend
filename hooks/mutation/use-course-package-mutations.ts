import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createCoursePackage,
  updateCoursePackage,
  CreateCoursePackageData,
} from "@/lib/api/course-packages";
import { showToast } from "@/lib/toast";

export function useCreateCoursePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCoursePackageData) => createCoursePackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coursePackages.all() });
      showToast.success("Course package created successfully");
    },
    onError: () => {
      showToast.error("Failed to create course package");
    },
  });
}

/** Deactivates a package version by setting its effectiveEndDate to today. */
export function useDeactivateCoursePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      updateCoursePackage(id, {
        effectiveEndDate: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coursePackages.all() });
      showToast.success("Course package deactivated");
    },
    onError: () => {
      showToast.error("Failed to deactivate course package");
    },
  });
}
