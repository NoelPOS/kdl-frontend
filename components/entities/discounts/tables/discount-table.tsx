"use client";

import type { Discount } from "@/app/types/discount.type";
import { DataTable, type Column } from "@/components/shared/data-table/data-table";

const columns: Column<Discount>[] = [
  {
    key: "_no",
    header: "No.",
    className: "w-16",
    render: (_row, index) => index + 1,
  },
  { key: "title", header: "Title" },
  { key: "amount", header: "Amount" },
  { key: "usage", header: "Description" },
];

export function DiscountTable({ discounts }: { discounts: Discount[] }) {
  return (
    <DataTable<Discount>
      data={discounts}
      columns={columns}
      keyExtractor={(d) => d.id}
      emptyMessage="No discounts found."
    />
  );
}
