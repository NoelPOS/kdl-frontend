import { Invoice, FetchAllInvoices } from "@/app/types/invoice.type";
import { InvoiceSubmission } from "@/app/types/enrollment.type";
import { clientApi, createServerApi } from "./config";

export interface InvoiceFilter {
  documentId?: string;
  student?: string;
  course?: string;
  receiptDone?: string;
}

// Client-side functions
export async function addNewInvoice(
  invoice: InvoiceSubmission
): Promise<Invoice> {
  const response = await clientApi.post<Invoice>("/invoices", invoice);
  return response.data;
}

export async function getInvoiceById(
  id: number,
  accessToken?: string
): Promise<Invoice> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Invoice>(`/invoices/${id}`);
  return response.data;
}

export async function markInvoiceReceiptDone(id: number): Promise<Invoice> {
  const response = await clientApi.patch<Invoice>(
    `/invoices/${id}/mark-receipt-done`
  );
  return response.data;
}

export async function getNextDocumentId(): Promise<{ nextDocumentId: string }> {
  const response = await clientApi.get<{ nextDocumentId: string }>(
    `/invoices/next-document-id`
  );
  return response.data;
}

// Server-side functions
export async function fetchInvoices(
  filter: InvoiceFilter = {},
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  invoices: Invoice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  if (filter.documentId) params.set("documentId", filter.documentId);
  if (filter.student) params.set("student", filter.student);
  if (filter.course) params.set("course", filter.course);
  if (filter.receiptDone) params.set("receiptDone", filter.receiptDone);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    invoices: Invoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/invoices?${params.toString()}`);
  return response.data;
}

export async function fetchAllInvoices(
  status?: string,
  accessToken?: string
): Promise<FetchAllInvoices> {
  const api = await createServerApi(accessToken);
  console.log("Fetching invoices with status:", status);
  if (!status) {
    const response = await api.get<FetchAllInvoices>("/invoices");
    return response.data;
  }
  const response = await api.get<FetchAllInvoices>(
    `/invoices?receiptDone=${status}`
  );
  return response.data;
}
