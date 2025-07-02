import InvoiceDetailRight from "@/components/invoices/invoice-detail-right";
import StudentDetail from "@/components/students/student.detail.left";
import { getInvoiceById, getStudentById } from "@/lib/axio";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{
    invoiceId: string;
    studentId: string;
  }>;
}) {
  const { studentId, invoiceId } = (await params) || {
    studentId: -1,
    invoiceId: -1,
  };
  const student = await getStudentById(Number(studentId));
  const invoice = await getInvoiceById(Number(invoiceId));

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
