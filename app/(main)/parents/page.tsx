import AddNewParent from "@/components/parents/add-new-parent/add-new-parent.dialog";
import ParentFilter from "@/components/parents/filter-parent";
import ParentSearch from "@/components/parents/search/parent.search";
import ParentList from "@/components/parents/parent.list";
import { Suspense } from "react";

export default async function ParentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4"></div>
          <ParentSearch />
          <ParentFilter />
        </div>
        <AddNewParent />
      </div>
      <Suspense key={`${query || ""}`} fallback={<div>Loading...</div>}>
        <ParentList query={query || ""} />
      </Suspense>
    </div>
  );
}
