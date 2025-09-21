import EnrollmentList from "@/components/entities/enrollments/lists/enrollment.list";
import EnrollmentFilter from "@/components/entities/enrollments/filters/enrollment-filter";
import PageHeader from "@/components/shared/page-header";
import { fetchEnrollments } from "@/lib/api";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AuthLoadingPage from "@/components/auth/auth-loading";

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    status?: string;
    course?: string;
    teacher?: string;
    student?: string;
    transactionType?: string;
    page?: string;
  }>;
}) {
  const {
    startDate,
    endDate,
    status,
    course,
    teacher,
    student,
    transactionType,
    page,
  } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  const hasFilters = startDate || endDate || status || course || teacher || student || transactionType;
  
  if (hasFilters) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchEnrollments(
        { startDate, endDate, status, course, teacher, student, transactionType },
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
      <PageHeader title="Create Invoice" lastUpdated={lastUpdated} />

      <EnrollmentFilter />
      {!hasFilters ? (
        <div className="text-center text-gray-500 mt-4">
          Please use the filter to search for enrollments.
        </div>
      ) : (
        <Suspense
          key={`${startDate || ""}${endDate || ""}${status || ""}${
            course || ""
          }${teacher || ""}${student || ""}${
            transactionType || ""
          }${currentPage}`}
          fallback={<AuthLoadingPage />}
        >
          <EnrollmentList
            startDate={startDate || ""}
            endDate={endDate || ""}
            status={status || ""}
            course={course || ""}
            teacher={teacher || ""}
            student={student || ""}
            transactionType={transactionType || ""}
            page={currentPage}
          />
        </Suspense>
      )}
    </div>
  );
}
