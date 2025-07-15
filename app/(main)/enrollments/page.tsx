import EnrollmentList from "@/components/enrollments/enrollment.list";
import EnrollmentFilter from "@/components/enrollments/enrollment-filter";
import { Suspense } from "react";

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    status?: string;
    course?: string;
    teacher?: string;
    student?: string;
    page?: string;
  }>;
}) {
  const { date, status, course, teacher, student, page } =
    (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Enrollments</div>
        </div>
      </div>
      <EnrollmentFilter />
      {!date && !status && !course && !teacher && !student ? (
        <div className="text-center text-gray-500 mt-4">
          Please use the filter to search for enrollments.
        </div>
      ) : (
        <Suspense
          key={`${date || ""}${status || ""}${course || ""}${teacher || ""}${
            student || ""
          }${currentPage}`}
          fallback={<div>Loading...</div>}
        >
          <EnrollmentList
            date={date || ""}
            status={status || ""}
            course={course || ""}
            teacher={teacher || ""}
            student={student || ""}
            page={currentPage}
          />
        </Suspense>
      )}
    </div>
  );
}
