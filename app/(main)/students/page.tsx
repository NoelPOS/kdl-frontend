import AddNewStudent from "@/components/entities/students/dialogs/add-new-student/add-new-student.dialog";
import StudentFilter from "@/components/entities/students/filters/filter-student";
import StudentList from "@/components/entities/students/lists/student.list";
import { Suspense } from "react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    active?: string;
    course?: string;
    page?: string;
  }>;
}) {
  const { query, active, course, page } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Students</div>
        </div>
        <AddNewStudent />
      </div>
      <StudentFilter />
      {!query && !active && !course ? (
        <div className="text-center text-gray-500 mt-4">
          Please use the filter to search for students.
        </div>
      ) : (
        <Suspense
          key={`${query || ""}${active || ""}${course || ""}${currentPage}`}
          fallback={<div>Loading...</div>}
        >
          <StudentList
            query={query || ""}
            active={active || ""}
            course={course || ""}
            page={currentPage}
          />
        </Suspense>
      )}
    </div>
  );
}
