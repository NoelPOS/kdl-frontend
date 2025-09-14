import React from "react";
import { StudentCard } from "../cards/student-card";
import { fetchStudents } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import LastUpdated from "@/components/shared/last-updated";
import { cookies } from "next/headers";

export default async function StudentList({
  query,
  active,
  course,
  courseType,
  page = 1,
}: {
  query: string;
  active: string;
  course: string;
  courseType: "fixed" | "camp" | "check" | "all" | "";
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { students, pagination, lastUpdated } = await fetchStudents(
    query,
    active,
    course,
    courseType,
    page,
    10,
    accessToken
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center">
        {students.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No students found
          </div>
        ) : (
          students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))
        )}
      </div>

      {students.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="students"
        />
      )}
    </div>
  );
}
