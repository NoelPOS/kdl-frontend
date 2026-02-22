import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  addNewStudent,
  updateStudentById,
} from "@/lib/api/students";
import { showToast } from "@/lib/toast";
import type { Student } from "@/app/types/student.type";

type NewStudentData = Omit<Student, "id" | "parentId">;

/** Create a new student. Invalidates the student list on success. */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewStudentData) => addNewStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      showToast.success("Student created successfully");
    },
    onError: (error) => {
      console.error("Failed to create student:", error);
      showToast.error("Failed to create student");
    },
  });
}

/** Update a student by ID. Invalidates the list and the specific detail cache. */
export function useUpdateStudent(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Student>) => updateStudentById(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(String(studentId)),
      });
      showToast.success("Student updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update student:", error);
      showToast.error("Failed to update student");
    },
  });
}

/**
 * Toggle a student's active status with optimistic update.
 * Reverts immediately if the server call fails.
 */
export function useToggleStudentActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      updateStudentById(id, { active } as Partial<Student>),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.students.all() });
      const snapshot = queryClient.getQueriesData({
        queryKey: queryKeys.students.lists(),
      });
      queryClient.setQueriesData(
        { queryKey: queryKeys.students.lists() },
        (old: any) => ({
          ...old,
          students: old?.students?.map((s: any) =>
            s.id === id ? { ...s, active } : s
          ),
        })
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      showToast.error("Failed to update student status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
    },
  });
}
