import AuthLoadingPage from "@/components/auth/auth-loading";
import AddNewParent from "@/components/entities/parents/dialogs/add-new-parent.dialog";
import ParentFilter from "@/components/entities/parents/filters/filter-parent";
import ParentList from "@/components/entities/parents/lists/parent.list";
import PageHeader from "@/components/shared/page-header";
import { fetchParents } from "@/lib/api";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function ParentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    child?: string;
    address?: string;
    page?: string;
  }>;
}) {
  const { query, child, address, page } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (query || child || address) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchParents(
        query || "",
        child || "",
        address || "",
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
      <PageHeader title="Parents" lastUpdated={lastUpdated}>
        <AddNewParent />
      </PageHeader>
      
      <ParentFilter />
      <div className="rounded-lg">
        {!query && !child && !address ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for parents.
          </div>
        ) : (
          <Suspense
            key={`${query || ""}${child || ""}${address || ""}${currentPage}`}
            fallback={<AuthLoadingPage />}
          >
            <ParentList
              query={query || ""}
              child={child || ""}
              address={address || ""}
              page={currentPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
