import AddNewStudent from "@/components/students/add-new-student/add-new-student.dialog";
import StudentSearch from "@/components/students/search/student.search";
import StudentList from "@/components/students/student.list";
import { Suspense } from "react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = (await searchParams) || "";

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4"></div>
          <StudentSearch />
        </div>
        <AddNewStudent />
      </div>
      <Suspense key={query} fallback={<div>Loading...</div>}>
        <StudentList query={query} />
      </Suspense>
    </div>
  );
}
