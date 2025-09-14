import React from "react";
import { TeacherCard } from "../cards/teacher-card";
import { fetchTeachers } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { cookies } from "next/headers";

export default async function TeacherList({
  query = "",
  status = "",
  course = "",
  page = 1,
}: {
  query?: string;
  status?: string;
  course?: string;
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { teachers, pagination } = await fetchTeachers(
    query,
    status,
    course,
    page,
    10,
    accessToken
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center">
        {teachers.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No teachers found
          </div>
        ) : (
          teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))
        )}
      </div>

      {teachers.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="teachers"
        />
      )}
    </div>
  );
}
