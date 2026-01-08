import { getServerSideUser } from "@/lib/jwt";
import { canAccessFinancials } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import { StatisticsFilter } from "@/components/entities/statistics/statistics-filter";
import AuthLoadingPage from "@/components/auth/auth-loading";
import { Suspense } from "react";
import StatisticsContent from "@/components/entities/statistics/statistics-content";
import { fetchDashboardOverview } from "@/lib/api";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  // Get user information from server-side
  const user = await getServerSideUser();
  
  // Check if user has permission to view analytics
  if (!user || !canAccessFinancials(user.role)) {
    redirect("/unauthorized");
  }

  // Check if user has clicked "Apply Filters"
  const hasAppliedFilters = resolvedSearchParams.hasOwnProperty('applied');

  // Get timestamp for last updated
  let lastUpdated: Date | undefined;
  if (hasAppliedFilters) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      
      const filter = {
        startDate: (resolvedSearchParams.startDate as string) || undefined,
        endDate: (resolvedSearchParams.endDate as string) || undefined,
        teacherId: resolvedSearchParams.teacherId ? parseInt(resolvedSearchParams.teacherId as string) : undefined,
        countBy: (resolvedSearchParams.countBy as 'timeslot' | 'enrollment') || undefined,
        attendance: (resolvedSearchParams.attendance as string) || undefined,
      };

      const { lastUpdated: timestamp } = await fetchDashboardOverview(accessToken, filter);
      lastUpdated = timestamp;
    } catch (error) {
      console.error("Failed to get timestamp:", error);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Statistics & Analytics" lastUpdated={lastUpdated} />
      
      <StatisticsFilter />
      
      {!hasAppliedFilters ? (
        <div className="mt-6 bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500">Please select filters and click &quot;Apply Filters&quot; to view statistics.</p>
        </div>
      ) : (
        <Suspense
          key={`${resolvedSearchParams.startDate || ""}${resolvedSearchParams.endDate || ""}${resolvedSearchParams.teacherId || ""}${resolvedSearchParams.countBy || ""}${resolvedSearchParams.attendance || ""}`}
          fallback={<AuthLoadingPage />}
        >
          <StatisticsContent
            startDate={(resolvedSearchParams.startDate as string) || undefined}
            endDate={(resolvedSearchParams.endDate as string) || undefined}
            teacherId={resolvedSearchParams.teacherId ? parseInt(resolvedSearchParams.teacherId as string) : undefined}
            countBy={(resolvedSearchParams.countBy as 'timeslot' | 'enrollment') || 'timeslot'}
            attendance={(resolvedSearchParams.attendance as string) || undefined}
          />
        </Suspense>
      )}
    </div>
  );
}
