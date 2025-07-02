import { Enrollment } from "@/app/types/enrollment.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import Link from "next/link";

export function EnrollmentTable({
  enrollments,
}: {
  enrollments: Enrollment[];
}) {
  return (
    <Table className="bg-white table-fixed rounded-2xl ">
      <TableHeader>
        <TableRow>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold ">
            Date
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Student Id
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Student Name
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Description
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Amount
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.session_id}>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {new Date(enrollment.session_createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {enrollment.student_id}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {enrollment.student_name}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {enrollment.course_title}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {enrollment.classOption_tuitionFee}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              <Link
                href={`/enrollment/${enrollment.student_id}/session/${enrollment.session_id}`}
              >
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Create Invoice
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
