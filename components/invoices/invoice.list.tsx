import React from "react";
import { fetchAllInvoices } from "@/lib/axio";
import { Invoice } from "@/app/types/invoice.type";
import { InvoiceTable } from "./invoice-table";

export default async function InvoiceList({ status }: { status: string }) {
  let invoices: Invoice[];

  if (status && status !== "All") {
    invoices = (await fetchAllInvoices(status)).invoices;
  } else {
    invoices = (await fetchAllInvoices()).invoices;
  }

  return (
    <div className="">
      {invoices.length > 0 ? (
        <InvoiceTable invoices={invoices} />
      ) : (
        <p>No invoices found.</p>
      )}
    </div>
  );
}
