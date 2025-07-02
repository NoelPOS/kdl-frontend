import InvoiceFilter from "@/components/invoices/invoice-filter";
import InvoiceList from "@/components/invoices/invoice.list";
import InvoiceSearch from "@/components/invoices/invoice.search";
import { Suspense } from "react";

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Invoices</div>
          <InvoiceSearch />
          <InvoiceFilter />
        </div>
      </div>
      <Suspense key={`${status || ""}`} fallback={<div>Loading...</div>}>
        <InvoiceList status={status || ""} />
      </Suspense>
    </div>
  );
}
