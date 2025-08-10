import { getStudentSessionsFiltered, StudentSessionFilter } from "@/lib/axio";
import { Student } from "@/app/types/course.type";

import StudentSessionList from "./student-session-list";

interface StudentSessionsContentProps {
  student: Student;
  searchParams: {
    courseName?: string;
    status?: string;
    payment?: string;
    page?: string;
  };
}

export default async function StudentSessionsContent({
  student,
  searchParams,
}: StudentSessionsContentProps) {
  const page = parseInt(searchParams.page || "1");
  const filters: StudentSessionFilter = {
    courseName: searchParams.courseName,
    status: searchParams.status,
    payment: searchParams.payment,
  };

  const { sessions, pagination } = await getStudentSessionsFiltered(
    Number(student.id),
    filters,
    page,
    12
  );

  return (
    <>
      <StudentSessionList sessions={sessions} pagination={pagination} />
    </>
  );
}
