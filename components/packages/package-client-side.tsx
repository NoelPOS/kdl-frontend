"use client";

import { Package } from "@/app/types/package.type";
import { PackageCard } from "./package-card";
import { Pagination } from "@/components/ui/pagination";

interface PackageClientSideProps {
  packages: Package[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function PackageClientSide({
  packages,
  pagination,
}: PackageClientSideProps) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No packages found</div>
        <div className="text-gray-400">
          Try adjusting your filter criteria or purchase a new package.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>

      {/* Use your existing Pagination component */}
      {packages.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalItems}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={6}
          itemName="packages"
        />
      )}
    </div>
  );
}
