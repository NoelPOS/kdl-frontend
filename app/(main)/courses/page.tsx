import Image from "next/image";
import CourseClientSide from "@/components/courses/course-client-side";
import AddNewCourse from "@/components/courses/add-new-course.dialog";
import { fetchCourses, searchCourses } from "@/lib/axio";
import CourseSearch from "@/components/courses/course-search";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  const courses = query ? await searchCourses(query) : await fetchCourses();

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4"></div>
          <CourseSearch />
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
