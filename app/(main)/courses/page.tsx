import CourseList from "@/components/entities/courses/lists/course-list";
import AddNewCourse from "@/components/entities/courses/dialogs/add-new-course.dialog";
import FilterCourse from "@/components/entities/courses/filters/filter-course";
import { Suspense } from "react";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    ageRange?: string;
    medium?: string;
    page?: string;
  }>;
}) {
  const { query, ageRange, medium, page } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Courses</div>
          <AddNewCourse />
        </div>
      </div>
      <FilterCourse />
      <div className="rounded-lg">
        {!query && !ageRange && !medium ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for courses.
          </div>
        ) : (
          <Suspense
            key={`${query || ""}${ageRange || ""}${medium || ""}${currentPage}`}
            fallback={<div>Loading...</div>}
          >
            <CourseList
              query={query || ""}
              ageRange={ageRange || ""}
              medium={medium || ""}
              page={currentPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
