import EnrollmentDetailRightMultiple from "@/components/enrollments/enrollment-detail-right-multiple";
import StudentDetail from "@/components/students/student.detail.left";
import {
  fetchActiveDiscounts,
  fetchSpedificPendingInvoices,
  getStudentById,
} from "@/lib/axio";
import Link from "next/link";

export default async function StudentSessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{
    studentId: string;
  }>;
  searchParams: Promise<{
    sessionIds?: string;
  }>;
}) {
  const { studentId } = (await params) || { studentId: -1 };
  const { sessionIds } = (await searchParams) || {};

  // Parse session IDs from comma-separated query parameter
  const sessionIdArray = sessionIds
    ? sessionIds.split(",").filter((id) => id.trim() !== "")
    : [];

  // console.log("Query Params - Session IDs: ", sessionIdArray);

  // If no session IDs provided, redirect or show error
  if (sessionIdArray.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Sessions Selected
          </h1>
          <p className="text-gray-600 mb-4">
            Please select enrollments from the enrollments page.
          </p>
        </div>
      </div>
    );
  }

  // Fetch student data and discounts in parallel
  const [student, discounts] = await Promise.all([
    getStudentById(Number(studentId)),
    fetchActiveDiscounts(),
  ]);

  // Fetch all sessions for the selected session IDs
  const sessions = await Promise.all(
    sessionIdArray.map((sessionId) => fetchSpedificPendingInvoices(sessionId))
  );

  console.log("Multiple Sessions Data: ", {
    sessionIdArray,
    sessions,
  });

  return (
    <div className="relative">
      <div className="flex min-h-screen ">
        {/* Left Side - Student Information */}
        <StudentDetail student={student} />

        {/* Right Side - Multiple Sessions */}
        <EnrollmentDetailRightMultiple
          sessionIds={sessionIdArray}
          sessions={sessions}
          discounts={discounts}
        />
      </div>
    </div>
  );
}
