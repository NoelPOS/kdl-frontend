import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  addNewParent,
  updateParentById,
  assignChildrenToParent,
  connectParentToStudent,
  type ConnectParentStudentData,
} from "@/lib/api/parents";
import { showToast } from "@/lib/toast";
import type { Parent } from "@/app/types/parent.type";

type NewParentData = Omit<Parent, "id">;

/** Create a new parent. Invalidates the parent list. */
export function useCreateParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewParentData) => addNewParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.lists() });
      showToast.success("Parent created successfully");
    },
    onError: (error) => {
      console.error("Failed to create parent:", error);
      showToast.error("Failed to create parent");
    },
  });
}

/** Update a parent by ID. Invalidates list and detail caches. */
export function useUpdateParent(parentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Parent>) =>
      updateParentById(parentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parents.detail(String(parentId)),
      });
      showToast.success("Parent updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update parent:", error);
      showToast.error("Failed to update parent");
    },
  });
}

/** Assign children (students) to a parent. Invalidates parent and student caches. */
export function useAssignChildrenToParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      parentId,
      data,
    }: {
      parentId: number;
      data: { studentIds: number[]; isPrimary?: boolean };
    }) => assignChildrenToParent(parentId, data),
    onSuccess: (_result, { parentId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parents.detail(String(parentId)),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      showToast.success("Children assigned successfully");
    },
    onError: (error) => {
      console.error("Failed to assign children:", error);
      showToast.error("Failed to assign children");
    },
  });
}

/** Connect an existing parent to a student. Invalidates both parent and student caches. */
export function useConnectParentToStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConnectParentStudentData) =>
      connectParentToStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parents.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      showToast.success("Parent connected to student");
    },
    onError: (error) => {
      console.error("Failed to connect parent:", error);
      showToast.error("Failed to connect parent to student");
    },
  });
}
