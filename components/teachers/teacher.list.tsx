import React from "react";
import { TeacherCard } from "./teacher-card";
import { fetchTeachers, searchTeachers } from "@/lib/axio";
import { Pagination } from "../ui/pagination";

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
  const { teachers, pagination } = await fetchTeachers(
    query,
    status,
    course,
    page,
    10
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
