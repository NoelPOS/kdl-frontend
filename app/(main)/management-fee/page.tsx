import { Suspense } from "react";
import DiscountFilter from "@/components/entities/discounts/filters/filter-discount";
import { AddNewDiscount } from "@/components/entities/discounts/dialogs/add-new-discount/add-new-discount.dialog";
import DiscountList from "@/components/entities/discounts/lists/discount.list";
import PageHeader from "@/components/shared/page-header";
import { fetchDiscounts } from "@/lib/api";
import { cookies } from "next/headers";

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
  }>;
}) {
  const { query } = (await searchParams) || {};

  // Get timestamp for discounts data
  let lastUpdated: Date | undefined;
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const { lastUpdated: timestamp } = await fetchDiscounts(accessToken);
    lastUpdated = timestamp;
  } catch (error) {
    console.error("Failed to get timestamp:", error);
  }

  return (
    <div className="p-6">
      <PageHeader title="Discounts and Fees Management" lastUpdated={lastUpdated}>
        <AddNewDiscount />
      </PageHeader>

      <DiscountFilter />

      <Suspense key={`${query || ""}`} fallback={<div>Loading...</div>}>
        <DiscountList query={query || ""} />
      </Suspense>
    </div>
  );
}
