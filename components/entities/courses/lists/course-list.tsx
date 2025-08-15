import { fetchFilteredCourses } from "@/lib/axio";
import CourseClientSide from "./course-client-side";

export default async function CourseList({
  query,
  ageRange,
  medium,
  page = 1,
}: {
  query: string;
  ageRange: string;
  medium: string;
  page?: number;
}) {
  const { courses, pagination } = await fetchFilteredCourses(
    { query, ageRange, medium },
    page,
    10
  );

  return <CourseClientSide courses={courses} pagination={pagination} />;
}
