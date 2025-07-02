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
import { Invoice } from "@/app/types/invoice.type";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <Table className="bg-white table-fixed rounded-2xl ">
      <TableHeader>
        <TableRow>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold ">
            Document Id
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Student Name
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Course Title
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Total Amount
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Receipt Done
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.documentId}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.session.student.name}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.session.course.title}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.totalAmount}
            </TableCell>
            <TableCell
              className={`border-2 border-gray-300 h-20 text-center whitespace-normal `}
            >
              <p
                className={`rounded-lg w-24 mx-auto ${
                  invoice.receiptDone
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {invoice.receiptDone ? "Yes" : "No"}
              </p>
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              <Link
                href={`/invoice/${invoice.id}/student/${invoice.session.student.id}`}
              >
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Details
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
