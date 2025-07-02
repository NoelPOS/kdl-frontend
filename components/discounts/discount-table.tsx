import { Discount } from "@/app/types/discount.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DiscountTable({ discounts }: { discounts: Discount[] }) {
  return (
    <Table className="bg-white table-fixed rounded-2xl ">
      <TableHeader>
        <TableRow>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold ">
            Title
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Amount
          </TableHead>
          <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
            Description
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discounts.map((discount) => (
          <TableRow key={discount.id}>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {discount.title}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {discount.amount}
            </TableCell>
            <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
              {discount.usage}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
