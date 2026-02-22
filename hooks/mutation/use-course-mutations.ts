import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { addNewCourse, updateCourse, deleteCourse } from "@/lib/api/courses";
import { showToast } from "@/lib/toast";
import type { Course } from "@/app/types/course.type";

type NewCourseData = Omit<Course, "id">;

/** Create a new course. Invalidates the course list on success. */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewCourseData) => addNewCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      showToast.success("Course created successfully");
    },
    onError: (error) => {
      console.error("Failed to create course:", error);
      showToast.error("Failed to create course");
    },
  });
}

/** Update a course by ID. Invalidates list and detail caches. */
export function useUpdateCourse(courseId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<Course, "id">>) =>
      updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(String(courseId)),
      });
      showToast.success("Course updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update course:", error);
      showToast.error("Failed to update course");
    },
  });
}

/** Delete a course by ID. Invalidates all course queries. */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string | number) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all() });
      showToast.success("Course deleted");
    },
    onError: (error) => {
      console.error("Failed to delete course:", error);
      showToast.error("Failed to delete course");
    },
  });
}
