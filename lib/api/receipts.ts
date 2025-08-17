import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function createReceipt(
  invoiceId: number
): Promise<{ receiptId: number }> {
  const response = await clientApi.post<{ receiptId: number }>(`/receipts`, {
    invoiceId,
    date: new Date().toISOString().split("T")[0],
  });
  return response.data;
}

export async function getReceiptById(id: number): Promise<any> {
  const response = await clientApi.get<any>(`/receipts/${id}`);
  return response.data;
}

export async function deleteReceipt(id: number): Promise<void> {
  await clientApi.delete(`/receipts/${id}`);
}

// Server-side functions
export async function getAllReceipts(accessToken?: string): Promise<any[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<any[]>(`/receipts`);
  return response.data;
}
