"use client";

import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Discount } from "@/app/types/discount.type";
import { Trash2 } from "lucide-react";

import { useRouter } from "next/navigation";
import {
  DiscountRow,
  Enrollment,
  InvoiceSubmission,
  SessionGroup,
} from "@/app/types/enrollment.type";
import { addNewInvoice } from "@/lib/api";

interface FormData {
  discountId: string;
}

const EnrollmentDetailRightMultiple = ({
  sessionIds,
  discounts,
  sessions,
}: {
  sessionIds: string[];
  discounts: Discount[];
  sessions: Enrollment[];
}) => {
  console.log("Sessions from EnrollmentDetailRightMultiple:", sessions);
  const [discountRows, setDiscountRows] = useState<DiscountRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const router = useRouter();

  // Function to check transaction type based on sessionId
  const checkType = (
    sessionId: number | string
  ): "course" | "courseplus" | "package" => {
    if (sessionId.toString().startsWith("cp-")) {
      return "courseplus";
    }
    if (sessionId.toString().startsWith("pkg-")) {
      return "package";
    }
    return "course";
  };

  // Generate document ID in format YYYYMMDD + random number
  const generateDocumentId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${year}${month}${day}${randomNum}`;
  };

  // Generate document ID once when component mounts
  const [documentId] = useState(() => generateDocumentId());

  // Calculate total amount from all sessions
  const totalAmount: number = useMemo(() => {
    const sessionTotal = sessions.reduce(
      (sum, session) => sum + Number(session.classoption_tuitionfee),
      0
    );
    const discountTotal = discountRows.reduce(
      (sum, discount) => sum + discount.amount,
      0
    );
    return sessionTotal + discountTotal;
  }, [discountRows, sessions]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      discountId: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);

    // Find the selected discount
    const selectedDiscount = discounts.find((d) => d.title === data.discountId);
    console.log("Selected discount:", selectedDiscount);
    if (selectedDiscount) {
      // Add discount to table
      const newDiscountRow: DiscountRow = {
        id: selectedDiscount.id,
        description: `${selectedDiscount.title}`,
        amount: selectedDiscount.amount,
      };

      setDiscountRows((prev) => [...prev, newDiscountRow]);
    }

    // Reset form and close dialog
    reset();
    setIsDialogOpen(false);
  };

  const removeDiscount = (discountId: string) => {
    setDiscountRows((prev) => prev.filter((row) => row.id !== discountId));
  };

  const handleCreateInvoice = async () => {
    if (sessions.length === 0) {
      alert("No sessions available to create invoice.");
      return;
    }

    const firstSession = sessions[0];

    // Create invoice items for all sessions
    const sessionItems = sessions.map((session, index) => ({
      description: `${session.course_title} - ${session.student_name} (Session ${sessionIds[index]})`,
      amount: Number(session.classoption_tuitionfee),
    }));

    // Group sessions by their transaction type and extract the correct IDs
    const sessionGroups = sessions.map((session, index) => {
      const sessionId = sessionIds[index];
      const transactionType = session.transaction_type || checkType(sessionId);

      // Extract the actual ID based on transaction type
      let actualId = sessionId;

      // If it's courseplus (cp-123), extract the number part
      if (transactionType === "courseplus" && sessionId.startsWith("cp-")) {
        actualId = sessionId.replace("cp-", "");
      }
      // If it's package (pkg-123), extract the number part
      else if (transactionType === "package" && sessionId.startsWith("pkg-")) {
        actualId = sessionId.replace("pkg-", "");
      }
      // For regular courses, sessionId is already the correct ID

      return {
        sessionId: sessionId,
        transactionType: transactionType,
        actualId: actualId,
      };
    });

    const invoiceData: InvoiceSubmission = {
      studentId: firstSession.student_id,
      documentId,
      date: new Date().toISOString().split("T")[0],
      paymentMethod,
      totalAmount,
      studentName: firstSession.student_name,
      courseName: `${sessions.map((s) => s.course_title).join(", ")}`,
      sessionGroups: sessionGroups,
      items: [
        ...sessionItems,
        ...discountRows.map((discount) => ({
          description: discount.description,
          amount: discount.amount,
        })),
      ],
    };

    console.log(
      "=== MULTIPLE SESSIONS INVOICE SUBMISSION DATA ===",
      invoiceData
    );

    try {
      console.log("Submitting invoice for multiple sessions...");
      const result = await addNewInvoice(invoiceData);
      console.log("Invoice created successfully:", result);
      router.replace(
        `/invoice/${result.id}/student/${firstSession.student_id}`
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  return (
    <div className="flex flex-col py-5 px-10 w-full h-screen ">
      {/* Component Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Invoice Generation - Multiple Sessions
        </h1>
        <p className="text-gray-600 mt-1">
          Create invoice for {sessions.length} selected sessions
        </p>
      </div>

      <div className="flex items-center justify-between flex-1/5">
        <div className="flex flex-col">
          <p className="text-lg ">Document Id: {documentId}</p>
          <p className="text-lg">Date: {new Date().toLocaleDateString()}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <span className="text-sm">Add Discount</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Add Discount
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="discount" className="text-sm text-gray-500">
                  Select Discount
                </label>
                <Controller
                  name="discountId"
                  control={control}
                  rules={{ required: "Please select a discount" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a discount" />
                      </SelectTrigger>
                      <SelectContent>
                        {discounts.map((discount) => (
                          <SelectItem key={discount.id} value={discount.title}>
                            {discount.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.discountId && (
                  <span className="text-red-500 text-xs">
                    {errors.discountId.message}
                  </span>
                )}
              </div>

              <DialogFooter className="gap-2 mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Add Discount</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Table with No, Description and Amount columns */}
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
              <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render each session as a row */}
            {sessions.map((session, index) => (
              <TableRow key={sessionIds[index]}>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {index + 1}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {session.course_title} - {session.student_name} (Session{" "}
                  {sessionIds[index]})
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  ${Number(session.classoption_tuitionfee).toFixed(2)}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  -
                </TableCell>
              </TableRow>
            ))}

            {/* Render discount rows */}
            {discountRows.map((discount, index) => (
              <TableRow key={discount.id}>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {sessions.length + index + 1}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {discount.description}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal text-red-600">
                  ${discount.amount.toFixed(2)}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDiscount(discount.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow className="bg-gray-50 font-semibold">
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal"></TableCell>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal"></TableCell>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal text-lg">
                Total
              </TableCell>
              <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                ${totalAmount.toFixed(2)}
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
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateInvoice}
            className="bg-yellow-500 hover:bg-yellow-600 text-white "
          >
            Create Invoice for {sessions.length} Sessions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailRightMultiple;
