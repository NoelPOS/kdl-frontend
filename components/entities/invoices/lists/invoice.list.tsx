import React from "react";
import { fetchInvoices, InvoiceFilter } from "@/lib/axio";
import { Invoice } from "@/app/types/invoice.type";
import { InvoiceTable } from "../tables/invoice-table";
import { Pagination } from "@/components/ui/pagination";

export default async function InvoiceList({
  documentId,
  student,
  course,
  receiptDone,
  page = 1,
}: {
  documentId: string;
  student: string;
  course: string;
  receiptDone: string;
  page?: number;
}) {
  const filter: InvoiceFilter = {
    documentId,
    student,
    course,
    receiptDone,
  };

  const { invoices, pagination } = await fetchInvoices(filter, page, 10);

  return (
    <div className="space-y-6">
      {invoices.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No invoices found</div>
      ) : (
        <InvoiceTable invoices={invoices} />
      )}

      {invoices.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="invoices"
        />
      )}
    </div>
  );
}
