import React from "react";
import { StudentCard } from "../cards/student-card";
import { fetchStudents } from "@/lib/api";
import { Student } from "@/app/types/student.type";
import { Pagination } from "@/components/ui/pagination";
import { cookies } from "next/headers";

export default async function StudentList({
  query,
  active,
  course,
  page = 1,
}: {
  query: string;
  active: string;
  course: string;
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { students, pagination } = await fetchStudents(
    query,
    active,
    course,
    page,
    10,
    accessToken
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
