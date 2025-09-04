import AddNewStudent from "@/components/entities/students/dialogs/add-new-student/add-new-student.dialog";
import StudentFilter from "@/components/entities/students/filters/filter-student";
import StudentList from "@/components/entities/students/lists/student.list";
import PageHeader from "@/components/shared/page-header";
import { fetchStudents } from "@/lib/api";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    active?: string;
    course?: string;
    courseType?: "fixed" | "camp" | "check" | "all";
    page?: string;
  }>;
}) {
  const { query, active, course, courseType, page } =
    (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (query || active || course || courseType) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchStudents(
        query || "",
        active || "",
        course || "",
        courseType || "",
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
      <PageHeader title="Students" lastUpdated={lastUpdated}>
        <AddNewStudent />
      </PageHeader>
      
      <StudentFilter />
      {!query && !active && !course && !courseType ? (
        <div className="text-center text-gray-500 mt-4">
          Please use the filter to search for students.
        </div>
      ) : (
        <Suspense
          key={`${query || ""}${active || ""}${course || ""}${
            courseType || ""
          }${currentPage}`}
          fallback={<div>Loading...</div>}
        >
          <StudentList
            query={query || ""}
            active={active || ""}
            course={course || ""}
            courseType={courseType || ""}
            page={currentPage}
          />
        </Suspense>
      )}
    </div>
  );
}
