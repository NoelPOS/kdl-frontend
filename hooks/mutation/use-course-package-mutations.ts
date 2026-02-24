import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createCoursePackage,
  updateCoursePackage,
  deleteCoursePackage,
  CreateCoursePackageData,
  UpdateCoursePackageData,
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

export function useUpdateCoursePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCoursePackageData }) =>
      updateCoursePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coursePackages.all() });
      showToast.success("Course package updated successfully");
    },
    onError: () => {
      showToast.error("Failed to update course package");
    },
  });
}

export function useDeleteCoursePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCoursePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coursePackages.all() });
      showToast.success("Course package deleted successfully");
    },
    onError: () => {
      showToast.error("Failed to delete course package");
    },
  });
}
