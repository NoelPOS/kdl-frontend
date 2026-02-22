"use client";

import { useEffect, useState, useCallback } from "react";
import { getTeacherCourses } from "@/lib/api";
import { useRemoveCourseFromTeacher } from "@/hooks/mutation/use-teacher-mutations";
import { Course } from "@/app/types/course.type";
import { CourseCard } from "@/components/entities/courses/cards/course-card";
import { Pagination } from "@/components/ui/pagination";
import RemoveCourseDialog from "../dialogs/remove-course-dialog";

interface TeacherCoursesListContentProps {
  teacherId: number;
  searchParams: {
    query?: string;
    page?: string;
  };
}

export default function TeacherCoursesListContent({
  teacherId,
  searchParams,
}: TeacherCoursesListContentProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });

  // State for remove course dialog
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const { mutate: removeCourse, isPending: isRemoving } =
    useRemoveCourseFromTeacher();

  const currentPage = parseInt(searchParams.page || "1");
  const searchQuery = searchParams.query;

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTeacherCourses(
        teacherId,
        { query: searchQuery },
        currentPage,
        12
      );
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch teacher courses:", error);
      setCourses([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  }, [teacherId, searchQuery, currentPage]);

  useEffect(() => {
    fetchCourses();
  }, [teacherId, searchQuery, currentPage, fetchCourses]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-6 h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {searchQuery ? "No courses found" : "No courses assigned"}
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? `No courses match "${searchQuery}"`
            : "This teacher doesn't have any assigned courses yet."}
        </p>
      </div>
    );
  }

  const handleRemoveClick = (courseId: number, courseName: string) => {
    setCourseToRemove({ id: courseId, name: courseName });
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!courseToRemove) return;

    removeCourse(
      { teacherId, courseId: courseToRemove.id },
      {
        onSuccess: () => {
          setRemoveDialogOpen(false);
          setCourseToRemove(null);
          fetchCourses();
        },
      }
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              setCourseId={() => {}}
              setCourseName={() => {}}
              onOpenDialog={() => {}}
              isTeacher={true}
              onRemove={() => handleRemoveClick(course.id, course.title)}
            />
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              itemsPerPage={12}
              itemName="courses"
            />
          </div>
        )}
      </div>

      <RemoveCourseDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={handleConfirmRemove}
        courseName={courseToRemove?.name || ""}
        isRemoving={isRemoving}
      />
    </>
  );
}
