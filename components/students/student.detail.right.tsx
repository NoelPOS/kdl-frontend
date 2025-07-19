import { Suspense } from "react";
import StudentDetailRightClient from "./student-detail-right-client";
import { ComfirmStudent } from "@/app/types/course.type";
import StudentSessionsContent from "./student-sessions-content";
import StudentSessionsLoading from "./student-sessions-loading";
import StudentSessionFilterComponent from "./student-session-filter";

export default async function StudentDetailRight({
  student,
  searchParams,
}: {
  student: ComfirmStudent;
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
      <Suspense key={suspenseKey} fallback={<StudentSessionsLoading />}>
        <StudentSessionsContent student={student} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
