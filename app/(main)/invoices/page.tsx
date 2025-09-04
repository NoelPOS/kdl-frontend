import InvoiceFilterNew from "@/components/entities/invoices/filters/invoice-filter";
import InvoiceList from "@/components/entities/invoices/lists/invoice.list";
import PageHeader from "@/components/shared/page-header";
import { fetchInvoices } from "@/lib/api";
import { cookies } from "next/headers";
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

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (documentId || student || course || receiptDone) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchInvoices(
        { documentId, student, course, receiptDone },
        1, // Just get first page for timestamp
        1, // Minimal limit
        accessToken
      );
      lastUpdated = timestamp;
    } catch (error) {
      console.error("Failed to get timestamp:", error);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Invoices" lastUpdated={lastUpdated} />
      
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
