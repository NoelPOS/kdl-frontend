import AddNewStudent from "@/components/students/add-new-student/add-new-student.dialog";
import StudentFilter from "@/components/students/filter-student";
import StudentSearch from "@/components/students/search/student.search";
import StudentList from "@/components/students/student.list";
import { Suspense } from "react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; active?: string }>;
}) {
  const { query, active } = (await searchParams) || {};

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4"></div>
          <StudentSearch />
          <StudentFilter />
        </div>
        <AddNewStudent />
      </div>
      <Suspense
        key={`${query || ""}${active || ""}`}
        fallback={<div>Loading...</div>}
      >
        <StudentList query={query || ""} active={active || ""} />
      </Suspense>
    </div>
  );
}
