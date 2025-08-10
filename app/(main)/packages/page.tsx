import PackageList from "@/components/packages/package-list";
import { BuyPackageDialog } from "@/components/packages/buy-package-dialog";
import FilterPackage from "@/components/packages/filter-package";
import { Suspense } from "react";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    classMode?: string;
    page?: string;
  }>;
}) {
  const { query, status, classMode, page } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Packages</div>
          <BuyPackageDialog />
        </div>
      </div>
      <FilterPackage />
      <div className="rounded-lg">
        {!query && !status && !classMode ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for packages.
          </div>
        ) : (
          <Suspense
            key={`${query || ""}${status || ""}${
              classMode || ""
            }${currentPage}`}
            fallback={<div>Loading packages...</div>}
          >
            <PackageList
              query={query || ""}
              status={status || ""}
              classMode={classMode || ""}
              page={currentPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
