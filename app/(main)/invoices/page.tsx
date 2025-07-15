import InvoiceFilterNew from "@/components/invoices/invoice-filter-new";
import InvoiceList from "@/components/invoices/invoice.list";
import { Suspense } from "react";

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{
    documentId?: string;
    student?: string;
    course?: string;
    receiptDone?: string;
    page?: string;
  }>;
}) {
  const { documentId, student, course, receiptDone, page } =
    (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Invoices</div>
        </div>
      </div>
      <InvoiceFilterNew />
      {!documentId && !student && !course && !receiptDone ? (
        <div className="text-center text-gray-500 mt-4">
          Please use the filter to search for invoices.
        </div>
      ) : (
        <Suspense
          key={`${documentId || ""}${student || ""}${course || ""}${
            receiptDone || ""
          }${currentPage}`}
          fallback={<div>Loading...</div>}
        >
          <InvoiceList
            documentId={documentId || ""}
            student={student || ""}
            course={course || ""}
            receiptDone={receiptDone || ""}
            page={currentPage}
          />
        </Suspense>
      )}
    </div>
  );
}
