import React from "react";
import { EnrollmentTable } from "./enrollment-table";

import { fetchPendingInvoices } from "@/lib/axio";
import { Enrollment } from "@/app/types/enrollment.type";

export default async function EnrollmentList({ query }: { query: string }) {
  let enrollments: Enrollment[];

  if (query) {
    // invoices = await searchInvoices(query);
    enrollments = await fetchPendingInvoices();
  } else {
    enrollments = await fetchPendingInvoices();
  }

  return (
    <div className="">
      {enrollments.length > 0 ? (
        <EnrollmentTable enrollments={enrollments} />
      ) : (
        <p>No enrollments found.</p>
      )}
    </div>
  );
}
