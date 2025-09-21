import AuthLoadingPage from "@/components/auth/auth-loading";
import AddNewRegistrar from "@/components/entities/registrars/dialogs/add-new-registrar.dialog";
import RegistrarFilter from "@/components/entities/registrars/filters/filter-registrar";
import RegistrarList from "@/components/entities/registrars/lists/registrar.list";
import PageHeader from "@/components/shared/page-header";
import { fetchRegistrars } from "@/lib/api";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function RegistrarsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const { query, page } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  // Get timestamp by making a lightweight API call when filters are active
  let lastUpdated: Date | undefined;
  if (query) {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const { lastUpdated: timestamp } = await fetchRegistrars(
        query || "",
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
      <PageHeader title="Registrars" lastUpdated={lastUpdated}>
        <AddNewRegistrar />
      </PageHeader>
      
      <RegistrarFilter />
      <div className="rounded-lg">
        {!query ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for registrars.
          </div>
        ) : (
          <Suspense
            key={`${query || ""}${currentPage}`}
            fallback={<AuthLoadingPage />}
          >
            <RegistrarList
              query={query || ""}
              page={currentPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
