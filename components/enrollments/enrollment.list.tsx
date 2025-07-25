import React from "react";
import { EnrollmentTable } from "./enrollment-table";
import { fetchEnrollments, EnrollmentFilter } from "@/lib/axio";
import { Enrollment } from "@/app/types/enrollment.type";
import { Pagination } from "@/components/ui/pagination";

export default async function EnrollmentList({
  date,
  status,
  course,
  teacher,
  student,
  page = 1,
}: {
  date: string;
  status: string;
  course: string;
  teacher: string;
  student: string;
  page?: number;
}) {
  const filter: EnrollmentFilter = {
    date,
    status,
    course,
    teacher,
    student,
  };

  const { enrollments, pagination } = await fetchEnrollments(filter, page, 10);

  // console.log("Enrollment List Data:", {
  //   enrollments,
  //   pagination,
  // });

  return (
    <div className="space-y-6">
      {enrollments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No enrollments found
        </div>
      ) : (
        <EnrollmentTable enrollments={enrollments} />
      )}

      {enrollments.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="enrollments"
        />
      )}
    </div>
  );
}
