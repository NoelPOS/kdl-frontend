import Image from "next/image";
import CourseClientSide from "@/components/courses/course-client-side";
import AddNewCourse from "@/components/courses/add-new-course.dialog";
import { fetchCourses, searchCourses, fetchFilteredCourses } from "@/lib/axio";
import CourseSearch from "@/components/courses/course-search";
import FilterCourse from "@/components/courses/filter-course";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; ageRange?: string; medium?: string }>;
}) {
  const { query, ageRange, medium } = await searchParams;

  let courses;
  if (query) {
    courses = await searchCourses(query);
  } else if (ageRange || medium) {
    // Default to 'all' if not set, to match your API's expected params
    courses = await fetchFilteredCourses(ageRange || "all", medium || "all");
  } else {
    courses = await fetchCourses();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Courses</div>
          <CourseSearch />
          <FilterCourse />
          <AddNewCourse />
        </div>
      </div>

      {courses.length > 0 ? (
        <CourseClientSide courses={courses} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <Image
            src="/globe.svg"
            alt="No courses"
            width={120}
            height={120}
            className="mb-6 opacity-80"
          />
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">
            No courses found!
          </h2>
        </div>
      )}
    </div>
  );
}
