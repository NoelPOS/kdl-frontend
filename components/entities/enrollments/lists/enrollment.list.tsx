import React from "react";
import { EnrollmentTableWithSelection } from "../tables/enrollment-table";
import { fetchEnrollments, EnrollmentFilter } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { cookies } from "next/headers";

export default async function EnrollmentList({
  startDate,
  endDate,
  status,
  course,
  teacher,
  student,
  transactionType,
  page = 1,
}: {
  startDate: string;
  endDate: string;
  status: string;
  course: string;
  teacher: string;
  student: string;
  transactionType: string;
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const filter: EnrollmentFilter = {
    startDate,
    endDate,
    status,
    course,
    teacher,
    student,
    transactionType,
  };

  const { enrollments, pagination } = await fetchEnrollments(
    filter,
    page,
    10,
    accessToken
  );

  return (
    <div className="space-y-6">
      {enrollments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No enrollments found
        </div>
      ) : (
        <EnrollmentTableWithSelection enrollments={enrollments} />
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
