import { getStudentSessionsFiltered, StudentSessionFilter } from "@/lib/api";
import { Student } from "@/app/types/course.type";

import StudentSessionList from "./student-session-list";
import { cookies } from "next/headers";

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
  const cookie = await cookies();
  const accessToken = cookie.get("accessToken")?.value;

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
    12,
    accessToken
  );

  return (
    <>
      <StudentSessionList
        sessions={sessions}
        student={student}
        pagination={pagination}
      />
    </>
  );
}
