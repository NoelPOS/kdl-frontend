import AddNewParent from "@/components/parents/add-new-parent/add-new-parent.dialog";
import ParentFilter from "@/components/parents/filter-parent";
import ParentList from "@/components/parents/parent.list";
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Parents</div>
        </div>
        <AddNewParent />
      </div>
      <ParentFilter />
      <div className="rounded-lg">
        {!query && !child && !address ? (
          <div className="text-center text-gray-500 mt-4">
            Please use the filter to search for parents.
          </div>
        ) : (
          <Suspense
            key={`${query || ""}${child || ""}${address || ""}${currentPage}`}
            fallback={<div>Loading...</div>}
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
