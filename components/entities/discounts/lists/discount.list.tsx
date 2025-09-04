import React from "react";
import { fetchDiscounts, searchDiscounts } from "@/lib/api";
import { Discount } from "@/app/types/discount.type";
import { DiscountTable } from "../tables/discount-table";
import { cookies } from "next/headers";

export default async function DiscountList({ query }: { query: string }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let discounts: Discount[];

  if (query) {
    discounts = await searchDiscounts(query, accessToken);
  } else {
    ({ discounts } = await fetchDiscounts(accessToken));
  }

  return (
    <div className="">
      {discounts.length > 0 ? (
        <DiscountTable discounts={discounts} />
      ) : (
        <p>No fees found.</p>
      )}
    </div>
  );
}
