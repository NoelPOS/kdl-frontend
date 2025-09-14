import React from "react";
import { ParentCard } from "../cards/parent-card";
import { Parent } from "@/app/types/parent.type";
import { Pagination } from "@/components/ui/pagination";
import { fetchParents } from "@/lib/api";
import { cookies } from "next/headers";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default async function ParentList({
  query,
  child,
  address,
  page = 1,
}: {
  query: string;
  child?: string;
  address?: string;
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { parents, pagination } = await fetchParents(
    query,
    child,
    address,
    page,
    10,
    accessToken
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center">
        {parents.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No parents found
          </div>
        ) : (
          parents.map((parent) => (
            <ParentCard key={parent.id} parent={parent} />
          ))
        )}
      </div>

      {parents.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="parents"
        />
      )}
    </div>
  );
}
