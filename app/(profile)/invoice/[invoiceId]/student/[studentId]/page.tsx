import InvoiceDetailRight from "@/components/entities/invoices/details/invoice-detail-right";
import StudentDetail from "@/components/entities/students/details/student.detail.left";
import { getInvoiceById, getStudentById } from "@/lib/api";
import { cookies } from "next/headers";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{
    invoiceId: string;
    studentId: string;
  }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const { studentId, invoiceId } = (await params) || {
    studentId: -1,
    invoiceId: -1,
  };
  const student = await getStudentById(Number(studentId), accessToken);
  const invoice = await getInvoiceById(Number(invoiceId), accessToken);

  return (
    <div className="relative">
      <div className="flex min-h-screen ">
        {/* Left Side - Student Information */}
        <StudentDetail student={student} />

        {/* Right Side  */}
        <InvoiceDetailRight invoice={invoice} />
      </div>
    </div>
  );
}
