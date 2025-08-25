import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Invoice } from "@/app/types/invoice.type";
import { DownloadReceiptButton } from "../components/download-receipt-button";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <Table className="bg-white table-fixed rounded-2xl ">
      <TableHeader>
        <TableRow>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold w-16">
            No.
          </TableHead>
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
            Payment Successful
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow key={invoice.id}>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {index + 1}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.documentId}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.studentName || "N/A"}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.courseName || "N/A"}
            </TableCell>

            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {invoice.totalAmount}
            </TableCell>
            <TableCell
              className={`border-2 border-gray-300 h-20 text-center whitespace-normal `}
            >
              {invoice.receiptDone ? (
                <DownloadReceiptButton invoice={invoice} />
              ) : (
                <p className=" w-24 mx-auto  py-1">No</p>
              )}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              <Link
                href={`/invoice/${invoice.id}/student/${invoice.studentId}`}
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
