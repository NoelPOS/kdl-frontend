import AddNewTeacher from "@/components/entities/teachers/dialogs/add-new-teacher/add-new-teacher.dialog";
import TeacherFilter from "@/components/entities/teachers/filters/filter-teacher";
import TeacherList from "@/components/entities/teachers/lists/teacher.list";
import PageHeader from "@/components/shared/page-header";
import { fetchTeachers } from "@/lib/api";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    course?: string;
    page?: string;
  }>;
}) {
  const { query, status, course, page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (query || status || course) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchTeachers(
        query || "",
        status || "",
        course || "",
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
      <PageHeader title="Teachers" lastUpdated={lastUpdated}>
        <AddNewTeacher />
      </PageHeader>
      
      <TeacherFilter />
      {!query && !status && !course ? (
        <div className="text-center text-gray-500 mt-4">
          Please use the filter to search for teachers.
        </div>
      ) : (
        <Suspense
          key={`${query || ""}${status || ""}${course || ""}`}
          fallback={<div>Loading...</div>}
        >
          <TeacherList
            query={query || ""}
            status={status || ""}
            course={course || ""}
            page={currentPage}
          />
        </Suspense>
      )}
    </div>
  );
}
