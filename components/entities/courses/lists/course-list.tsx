import { fetchFilteredCourses } from "@/lib/api";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { courses, pagination, lastUpdated } = await fetchFilteredCourses(
    { query, ageRange, medium },
    page,
    10,
    accessToken
  );

  return <CourseClientSide courses={courses} pagination={pagination} lastUpdated={lastUpdated} />;
}
