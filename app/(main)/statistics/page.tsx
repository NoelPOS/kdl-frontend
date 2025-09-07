import { fetchDashboardOverview } from "@/lib/api";
import { getServerSideUser } from "@/lib/jwt";
import { canAccessFinancials } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import StatisticsClientWrapper from "@/components/entities/statistics/statistics-client-wrapper";

export default async function StatisticsPage() {
  // Get user information from server-side
  const user = await getServerSideUser();
  
  // Check if user has permission to view analytics
  if (!user || !canAccessFinancials(user.role)) {
    redirect("/unauthorized");
  }

  // Fetch analytics data
  let analyticsData = null;
  let lastUpdated: Date | undefined;
  let error: string | null = null;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const result = await fetchDashboardOverview(accessToken);
    analyticsData = result.data;
    lastUpdated = result.lastUpdated;
  } catch (err) {
    console.error("Failed to fetch analytics data:", err);
    error = "Failed to load analytics data. Please try again later.";
  }

  return (
    <div className="p-6">
      <PageHeader title="Statistics & Analytics" lastUpdated={lastUpdated} />
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-medium mb-2">Unable to Load Analytics</h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <StatisticsClientWrapper initialData={analyticsData} />
      )}
    </div>
  );
}
