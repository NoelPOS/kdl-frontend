"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Invoice } from "@/app/types/invoice.type";
import { cancelInvoice, confirmPayment } from "@/lib/api/invoices";
import { generateReceiptPDF } from "@/lib/pdf-utils";
import { generateSimpleReceiptPDF } from "@/lib/simple-pdf-utils";

const InvoiceDetailRight = ({ invoice }: { invoice: Invoice }) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState(invoice.paymentMethod);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDownloadPromptOpen, setIsDownloadPromptOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleConfirmPayment = async (invoiceId: number) => {
    try {
      const toastId = showToast.loading("Confirming payment...");
      await confirmPayment(invoiceId, paymentMethod);
      showToast.dismiss(toastId);
      showToast.success("Payment confirmed successfully!");
      setIsPaymentConfirmOpen(false);
      // Show download receipt prompt
      setIsDownloadPromptOpen(true);
    } catch (error) {
      console.error("Error confirming payment:", error);
      showToast.error(
        "Error processing payment confirmation. Please try again."
      );
    }
  };

  const handleDownloadReceipt = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      await generateReceiptPDF(invoice);
      showToast.success("Receipt downloaded successfully!");
    } catch (error) {
      await generateSimpleReceiptPDF(invoice);
      console.error("Error downloading receipt:", error);
      showToast.error("Failed to download receipt. Please try again.");
    } finally {
      setIsDownloading(false);
      setIsDownloadPromptOpen(false);
      router.push("/invoices");
    }
  };

  const handleSkipDownload = () => {
    setIsDownloadPromptOpen(false);
    router.push("/invoices");
  };

  const handleCancelInvoice = async (invoiceId: number) => {
    try {
      const toastId = showToast.loading("Cancelling invoice...");
      const allUpdatesSuccessful = await cancelInvoice(invoiceId);
      if (allUpdatesSuccessful) {
        showToast.dismiss(toastId);
        showToast.success("Invoice cancelled successfully!");
        setIsCancelOpen(false);
        router.push("/enrollments");
      }
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      showToast.error("Error cancelling invoice. Please try again.");
    }
  };
  return (
    <div className="flex flex-col py-5 px-10 w-full h-screen ">
      {/* Component Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
      </div>

      <div className="flex items-center justify-between flex-1/5">
        <div className="flex flex-col">
          <p className="text-lg ">Document Id: {invoice.documentId}</p>
          <p className="text-lg">
            Date: {new Date(invoice.date).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      <div className="flex-3/5 py-4">
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
            {invoice.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {index + 1}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {item.description}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal ">
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
          <Select
            value={paymentMethod.toLowerCase().replace(/\s+/g, "-")}
            onValueChange={(value) => {
              const paymentMethods = {
                "credit-card": "Credit Card",
                "debit-card": "Debit Card",
                cash: "Cash",
                "bank-transfer": "Bank Transfer",
              };
              setPaymentMethod(
                paymentMethods[value as keyof typeof paymentMethods] ||
                  "Credit Card"
              );
            }}
            disabled={invoice.receiptDone}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit-card">Credit Card</SelectItem>
              <SelectItem value="debit-card">Debit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          {!invoice.receiptDone && (
            <>
              {/* Cancel Invoice Button */}
              <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <span className="text-sm">Cancel Invoice</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] p-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                      Cancel Invoice
                    </DialogTitle>
                  </DialogHeader>

                  <p className="text-center">
                    Are you sure you want to cancel this invoice?
                  </p>

                  <DialogFooter className="gap-2 mt-6">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        No
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={() => handleCancelInvoice(invoice.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Yes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Confirm Payment Button */}
              <Dialog
                open={isPaymentConfirmOpen}
                onOpenChange={setIsPaymentConfirmOpen}
              >
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

                  <div className="text-center">
                    <p>
                      Are you sure you want to confirm payment for this invoice?
                    </p>
                    {paymentMethod !== invoice.paymentMethod && (
                      <p className="text-sm text-yellow-600 mt-2">
                        Payment method will be updated to:{" "}
                        <strong>{paymentMethod}</strong>
                      </p>
                    )}
                  </div>

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
            </>
          )}
        </div>
      </div>

      {/* Download Receipt Prompt Dialog */}
      <Dialog
        open={isDownloadPromptOpen}
        onOpenChange={setIsDownloadPromptOpen}
      >
        <DialogContent className="sm:max-w-[500px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Payment Confirmed!
            </DialogTitle>
          </DialogHeader>

          <div className="text-center">
            <p className="mb-4">
              Payment has been successfully confirmed. Would you like to
              download the receipt now?
            </p>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipDownload}
              disabled={isDownloading}
            >
              Skip
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                "Download Receipt"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceDetailRight;
