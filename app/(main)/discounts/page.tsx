import { Suspense } from "react";
import DiscountSearch from "@/components/discounts/search/discount.search";
import { AddNewDiscount } from "@/components/discounts/add-new-discount/add-new-discount.dialog";
import DiscountList from "@/components/discounts/discount.list";

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
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4 text-3xl font-medium">Discounts</div>
          <DiscountSearch />
        </div>
        <AddNewDiscount />
      </div>
      <Suspense key={`${query || ""}`} fallback={<div>Loading...</div>}>
        <DiscountList query={query || ""} />
      </Suspense>
    </div>
  );
}
