import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  addNewDiscount,
  updateDiscount,
  deleteDiscount,
} from "@/lib/api/discounts";
import { showToast } from "@/lib/toast";
import type { Discount } from "@/app/types/discount.type";

type NewDiscountData = Omit<Discount, "id">;

/** Create a new discount. Invalidates the discount list. */
export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewDiscountData) => addNewDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all() });
      showToast.success("Discount created successfully");
    },
    onError: (error) => {
      console.error("Failed to create discount:", error);
      showToast.error("Failed to create discount");
    },
  });
}

/** Update a discount by ID. Invalidates the discount list. */
export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<Omit<Discount, "id">>;
    }) => updateDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all() });
      showToast.success("Discount updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update discount:", error);
      showToast.error("Failed to update discount");
    },
  });
}

/** Delete a discount by ID. Invalidates the discount list. */
export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discountId: string | number) => deleteDiscount(discountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discounts.all() });
      showToast.success("Discount deleted");
    },
    onError: (error) => {
      console.error("Failed to delete discount:", error);
      showToast.error("Failed to delete discount");
    },
  });
}
