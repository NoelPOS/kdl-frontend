import React from "react";
import { fetchDiscounts, searchDiscounts } from "@/lib/axio";
import { Discount } from "@/app/types/discount.type";
import { DiscountTable } from "./discount-table";

export default async function DiscountList({ query }: { query: string }) {
  let discounts: Discount[];

  if (query) {
    discounts = await searchDiscounts(query);
  } else {
    discounts = await fetchDiscounts();
  }
  //   console.log("Discounts fetched:", discounts);

  return (
    <div className="">
      {discounts.length > 0 ? (
        <DiscountTable discounts={discounts} />
      ) : (
        <p>No discounts found.</p>
      )}
    </div>
  );
}
