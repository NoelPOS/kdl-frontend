import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createClassOption,
  updateClassOption,
  deleteClassOption,
} from "@/lib/api/class-options";
import { showToast } from "@/lib/toast";
import type {
  CreateClassOptionDto,
  UpdateClassOptionDto,
} from "@/app/types/class-option.type";

/** Create a new class option. Invalidates the class-options cache. */
export function useCreateClassOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassOptionDto) => createClassOption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classOptions.all() });
      showToast.success("Class option created successfully");
    },
    onError: (error) => {
      console.error("Failed to create class option:", error);
      showToast.error("Failed to create class option");
    },
  });
}

/** Update a class option by ID (e.g., set effectiveEndDate to deactivate). */
export function useUpdateClassOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassOptionDto }) =>
      updateClassOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classOptions.all() });
      showToast.success("Class option updated");
    },
    onError: (error) => {
      console.error("Failed to update class option:", error);
      showToast.error("Failed to update class option");
    },
  });
}

/** Delete a class option by ID. */
export function useDeleteClassOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClassOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classOptions.all() });
      showToast.success("Class option deleted");
    },
    onError: (error) => {
      console.error("Failed to delete class option:", error);
      showToast.error("Failed to delete class option");
    },
  });
}
