import { Suspense } from "react";
import DiscountFilter from "@/components/entities/discounts/filters/filter-discount";
import { AddNewDiscount } from "@/components/entities/discounts/dialogs/add-new-discount/add-new-discount.dialog";
import DiscountList from "@/components/entities/discounts/lists/discount.list";

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
  }>;
}) {
  const { query } = (await searchParams) || {};

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-medium">Management Fees</h1>
        <AddNewDiscount />
      </div>

      <DiscountFilter />

      <Suspense key={`${query || ""}`} fallback={<div>Loading...</div>}>
        <DiscountList query={query || ""} />
      </Suspense>
    </div>
  );
}
