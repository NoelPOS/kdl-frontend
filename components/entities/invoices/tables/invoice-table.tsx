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
    <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border" style={{ maxWidth: '100vw' }}>
      <Table className="min-w-max w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[50px]">
            No.
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[120px]">
            Document Id
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[150px]">
            Student Name
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[150px]">
            Course Title
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[120px]">
            Total Amount
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[150px]">
            Payment Successful
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-nowrap font-semibold min-w-[100px]">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow key={invoice.id}>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-nowrap px-2 min-w-[50px]">
              {index + 1}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-nowrap px-2 min-w-[120px]">
              {invoice.documentId}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-nowrap px-2 min-w-[150px]">
              {invoice.studentName || "N/A"}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center px-2 min-w-[150px] max-w-[200px]">
              <div className="truncate" title={invoice.courseName || "N/A"}>
                {invoice.courseName || "N/A"}
              </div>
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-nowrap px-2 min-w-[120px]">
              {invoice.totalAmount}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center px-2 min-w-[150px]">
              {invoice.receiptDone ? (
                <DownloadReceiptButton invoice={invoice} />
              ) : (
                <p className="w-24 mx-auto py-1">No</p>
              )}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center px-2 min-w-[100px]">
              <Link
                href={`/invoice/${invoice.id}/student/${invoice.studentId}`}
              >
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white whitespace-nowrap">
                  Details
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
