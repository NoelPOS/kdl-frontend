import EnrollmentDetailRight from "@/components/enrollments/enrollment-detail-right";
import StudentDetail from "@/components/students/student.detail.left";
import {
  fetchActiveDiscounts,
  fetchSpedificPendingInvoices,
  getStudentById,
} from "@/lib/axio";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{
    studentId: string;
    sessionId: string;
  }>;
}) {
  const { studentId, sessionId } = (await params) || {
    studentId: -1,
    sessionId: -1,
  };
  // const student = await getStudentById(Number(studentId));
  // const discounts = await fetchActiveDiscounts();
  // const session = await fetchSpedificPendingInvoices(Number(sessionId));

  const [student, discounts, session] = await Promise.all([
    getStudentById(Number(studentId)),
    fetchActiveDiscounts(),
    fetchSpedificPendingInvoices(sessionId),
  ]);

  console.log("Session Data: ", session);

  return (
    <div className="relative">
      <div className="flex min-h-screen ">
        {/* Left Side - Student Information */}
        <StudentDetail student={student} />

        {/* Right Side  */}
        <EnrollmentDetailRight
          sessionId={sessionId}
          session={session}
          discounts={discounts}
        />
      </div>
    </div>
  );
}
