import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  addNewInvoice,
  markInvoiceReceiptDone,
  updateInvoicePaymentMethod,
  cancelInvoice,
  confirmPayment,
} from "@/lib/api/invoices";
import { showToast } from "@/lib/toast";
import type { InvoiceSubmission } from "@/app/types/enrollment.type";

/** Create a new invoice (enrollment payment record). Invalidates invoice and enrollment lists. */
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceSubmission) => addNewInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Invoice created successfully");
    },
    onError: (error) => {
      console.error("Failed to create invoice:", error);
      showToast.error("Failed to create invoice");
    },
  });
}

/** Mark an invoice's receipt as done. */
export function useMarkReceiptDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: number) =>
      markInvoiceReceiptDone(invoiceId),
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.detail(String(invoiceId)),
      });
      showToast.success("Receipt marked as done");
    },
    onError: (error) => {
      console.error("Failed to mark receipt:", error);
      showToast.error("Failed to update receipt status");
    },
  });
}

/** Update an invoice's payment method. */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      paymentMethod,
    }: {
      invoiceId: number;
      paymentMethod: string;
    }) => updateInvoicePaymentMethod(invoiceId, paymentMethod),
    onSuccess: (_data, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.detail(String(invoiceId)),
      });
      showToast.success("Payment method updated");
    },
    onError: (error) => {
      console.error("Failed to update payment method:", error);
      showToast.error("Failed to update payment method");
    },
  });
}

/** Cancel an invoice. Invalidates invoice and session caches. */
export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: number) => cancelInvoice(invoiceId),
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.detail(String(invoiceId)),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Invoice cancelled");
    },
    onError: (error) => {
      console.error("Failed to cancel invoice:", error);
      showToast.error("Failed to cancel invoice");
    },
  });
}

/** Confirm payment for an invoice. */
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      paymentMethod,
    }: {
      invoiceId: number;
      paymentMethod: string;
    }) => confirmPayment(invoiceId, paymentMethod),
    onSuccess: (_data, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.detail(String(invoiceId)),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all() });
      showToast.success("Payment confirmed");
    },
    onError: (error) => {
      console.error("Failed to confirm payment:", error);
      showToast.error("Failed to confirm payment");
    },
  });
}
