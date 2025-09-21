import { Suspense } from "react";
import StudentDetailRightClient from "./student-detail-right-client";
import { Student } from "@/app/types/course.type";
import StudentSessionsContent from "../sessions/student-sessions-content";
import StudentSessionsLoading from "../sessions/student-sessions-loading";
import StudentSessionFilterComponent from "../sessions/student-session-filter";
import AuthLoadingPage from "@/components/auth/auth-loading";

export default async function StudentDetailRight({
  student,
  searchParams,
}: {
  student: Student;
  searchParams: {
    courseName?: string;
    status?: string;
    payment?: string;
    page?: string;
  };
}) {
  // Create a key for Suspense to re-trigger when search params change
  const suspenseKey = `${searchParams.courseName || ""}${
    searchParams.status || ""
  }${searchParams.payment || ""}${searchParams.page || ""}`;

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Sessions</h1>
        <StudentDetailRightClient studentData={[student]} />
      </div>
      <StudentSessionFilterComponent />
      <Suspense key={suspenseKey} fallback={<AuthLoadingPage />}>
        <StudentSessionsContent student={student} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
