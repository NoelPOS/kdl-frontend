import AddNewTeacher from "@/components/entities/teachers/dialogs/add-new-teacher/add-new-teacher.dialog";
import TeacherFilter from "@/components/entities/teachers/filters/filter-teacher";
import TeacherList from "@/components/entities/teachers/lists/teacher.list";
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Teachers</div>
        </div>
        <AddNewTeacher />
      </div>
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
