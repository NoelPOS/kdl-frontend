"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "../ui/table";
import { Button } from "../ui/button";
import { CheckCircle2, Receipt } from "lucide-react";

import { useRouter } from "next/navigation";
import { Invoice } from "@/app/types/invoice.type";
import { changeSessionStatus, createReceipt } from "@/lib/axio";

const InvoiceDetailRight = ({ invoice }: { invoice: Invoice }) => {
  console.log("Invoice Detail Right Component Rendered", invoice);
  const router = useRouter();

  const handleConfirmPayment = async (invoiceId: number) => {
    try {
      // Determine which ID to use for status update based on invoice type
      let statusId: number | null = null;

      if (invoice.type === "course" && invoice.sessionId) {
        statusId = invoice.sessionId;
      } else if (invoice.type === "courseplus" && invoice.coursePlusId) {
        statusId = invoice.coursePlusId;
      } else if (invoice.type === "package" && invoice.packageId) {
        // For package, we might need a different approach since packageId could be a string
        // You may need to update the changeSessionStatus function or create a new one for packages
        console.log("Package payment confirmation - ID:", invoice.packageId);
      }

      if (statusId) {
        const success = await changeSessionStatus(statusId, "paid");
        if (!success) {
          console.error("Failed to change session status to paid");
          return;
        }
      }

      const result = await createReceipt(invoiceId);
      console.log("Receipt created successfully:", result);
      router.push("/invoices");
    } catch (error) {
      console.error("Error creating receipt:", error);
    }
  };
  return (
    <div className="flex flex-col py-5 px-10 w-full h-screen ">
      {/* Component Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
        <p className="text-gray-600 mt-1">
          View and manage invoice for {invoice.studentName || "N/A"} -{" "}
          {invoice.courseName || "N/A"} ({invoice.type})
        </p>
      </div>

      <div className="flex items-center justify-between flex-1/5">
        <div className="flex flex-col">
          <p className="text-lg ">Document Id: {invoice.documentId}</p>
          <p className="text-lg">
            Date: {new Date(invoice.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          <Receipt className="h-5 w-5" />
          <span className="text-sm font-medium">Receipt Generated</span>
        </div>
      </div>

      <div className="flex-3/5">
        <Table className=" bg-white rounded-2xl ">
          <TableHeader>
            <TableRow>
              <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
                No
              </TableHead>
              <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
                Description
              </TableHead>
              <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                1
              </TableCell>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                {invoice.courseName || "Main Invoice"} -{" "}
                {invoice.studentName || "N/A"} ({invoice.type})
              </TableCell>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                {invoice.totalAmount}
              </TableCell>
            </TableRow>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {index + 2}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {item.description}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal text-red-600">
                  {item.amount}
                </TableCell>
              </TableRow>
            ))}
            {/* Total Row */}
            <TableRow className="bg-gray-50 font-semibold">
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal"></TableCell>

              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal text-lg">
                Total
              </TableCell>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                {invoice.totalAmount}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex-1/5">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-lg">Payment Method:</p>
          <p className="text-lg font-semibold">{invoice.paymentMethod}</p>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => router.back()}
          >
            Back
          </Button>
          {!invoice.receiptDone && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <span className="text-sm">Confirm Payment</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    Confirm Payment
                  </DialogTitle>
                </DialogHeader>

                <p className="text-center">
                  Are you sure you want to confirm payment for this invoice?
                </p>

                <DialogFooter className="gap-2 mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={() => handleConfirmPayment(invoice.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailRight;
