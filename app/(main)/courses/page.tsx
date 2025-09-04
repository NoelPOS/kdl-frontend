import CourseList from "@/components/entities/courses/lists/course-list";
import AddNewCourse from "@/components/entities/courses/dialogs/add-new-course.dialog";
import AddBlankCoursesDialog from "@/components/entities/courses/dialogs/add-blank-courses.dialog";
import FilterCourse from "@/components/entities/courses/filters/filter-course";
import PageHeader from "@/components/shared/page-header";
import { fetchFilteredCourses } from "@/lib/api";
import { cookies } from "next/headers";
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

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (query || ageRange || medium) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchFilteredCourses(
        { query, ageRange, medium },
        1, // Just get first page for timestamp
        1, // Minimal limit
        accessToken
      );
      lastUpdated = timestamp;
    } catch (error) {
      console.error("Failed to get timestamp:", error);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Courses" lastUpdated={lastUpdated}>
        <AddBlankCoursesDialog />
        <AddNewCourse />
      </PageHeader>
      
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
