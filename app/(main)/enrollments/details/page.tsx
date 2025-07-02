import EnrollmentList from "@/components/enrollments/enrollment.list";
import EnrollmentSearch from "@/components/enrollments/enrollment.search";

import { Suspense } from "react";

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Enrollments</div>
          <EnrollmentSearch />
          {/* <InvoiceFilter /> */}
        </div>
      </div>
      <Suspense key={`${query || ""}`} fallback={<div>Loading...</div>}>
        <EnrollmentList query={query || ""} />
      </Suspense>
    </div>
  );
}
