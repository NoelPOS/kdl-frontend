import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  addNewTeacher,
  updateTeacherById,
  deleteTeacherById,
  assignCoursesToTeacher,
  removeCourseFromTeacher,
  createTeacherAbsence,
  updateTeacherAbsence,
  deleteTeacherAbsence,
} from "@/lib/api/teachers";
import { showToast } from "@/lib/toast";
import type { Teacher } from "@/app/types/teacher.type";

type NewTeacherData = Omit<Teacher, "id">;

/** Create a new teacher. Invalidates the teacher list on success. */
export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewTeacherData) => addNewTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.lists() });
      showToast.success("Teacher created successfully");
    },
    onError: (error) => {
      console.error("Failed to create teacher:", error);
      showToast.error("Failed to create teacher");
    },
  });
}

/** Update a teacher by ID. Invalidates list and detail caches. */
export function useUpdateTeacher(teacherId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Teacher>) => updateTeacherById(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(String(teacherId)),
      });
      showToast.success("Teacher updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update teacher:", error);
      showToast.error("Failed to update teacher");
    },
  });
}

/** Remove teacher access (sets role to "none"). Invalidates all teacher queries. */
export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: number) => deleteTeacherById(teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all() });
      showToast.success("Teacher removed successfully");
    },
    onError: (error) => {
      console.error("Failed to remove teacher:", error);
      showToast.error("Failed to remove teacher");
    },
  });
}

/** Assign courses to a teacher. Invalidates the teacher's detail cache. */
export function useAssignCoursesToTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      courseIds,
    }: {
      teacherId: number;
      courseIds: number[];
    }) => assignCoursesToTeacher(teacherId, courseIds),
    onSuccess: (_data, { teacherId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(String(teacherId)),
      });
      showToast.success("Courses assigned successfully");
    },
    onError: (error) => {
      console.error("Failed to assign courses:", error);
      showToast.error("Failed to assign courses");
    },
  });
}

/** Remove a course from a teacher. Invalidates the teacher's detail cache. */
export function useRemoveCourseFromTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      courseId,
    }: {
      teacherId: number;
      courseId: number;
    }) => removeCourseFromTeacher(teacherId, courseId),
    onSuccess: (_data, { teacherId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(String(teacherId)),
      });
      showToast.success("Course removed from teacher");
    },
    onError: (error) => {
      console.error("Failed to remove course:", error);
      showToast.error("Failed to remove course");
    },
  });
}

/** Create a teacher absence record. */
export function useCreateTeacherAbsence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      data,
    }: {
      teacherId: number;
      data: { absenceDate: string; reason?: string };
    }) => createTeacherAbsence(teacherId, data),
    onSuccess: (_data, { teacherId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(String(teacherId)),
      });
      showToast.success("Absence recorded");
    },
    onError: (error) => {
      console.error("Failed to record absence:", error);
      showToast.error("Failed to record absence");
    },
  });
}

/** Update a teacher absence record. */
export function useUpdateTeacherAbsence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      absenceId,
      data,
    }: {
      teacherId: number;
      absenceId: number;
      data: { absenceDate?: string; reason?: string };
    }) => updateTeacherAbsence(teacherId, absenceId, data),
    onSuccess: (_data, { teacherId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(String(teacherId)),
      });
      showToast.success("Absence updated");
    },
    onError: (error) => {
      console.error("Failed to update absence:", error);
      showToast.error("Failed to update absence");
    },
  });
}

/** Delete a teacher absence record. */
export function useDeleteTeacherAbsence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teacherId,
      absenceId,
    }: {
      teacherId: number;
      absenceId: number;
    }) => deleteTeacherAbsence(teacherId, absenceId),
    onSuccess: (_data, { teacherId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.detail(String(teacherId)),
      });
      showToast.success("Absence deleted");
    },
    onError: (error) => {
      console.error("Failed to delete absence:", error);
      showToast.error("Failed to delete absence");
    },
  });
}
