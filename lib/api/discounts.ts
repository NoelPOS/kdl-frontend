import { Discount } from "@/app/types/discount.type";
import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function searchDiscounts(
  query: string,
  accessToken?: string
): Promise<Discount[]> {
  const api = accessToken ? await createServerApi(accessToken) : clientApi;
  const response = await api.get<Discount[]>(
    `/discounts/search/${encodeURIComponent(query)}`
  );
  console.log("Discounts searched:", response.data);
  return response.data;
}

export async function getDiscountById(id: string): Promise<Partial<Discount>> {
  const response = await clientApi.get<Partial<Discount>>(`/discounts/${id}`);
  return response.data;
}

type NewDiscountData = Omit<Discount, "id">;

export async function addNewDiscount(
  discount: NewDiscountData
): Promise<Discount> {
  const response = await clientApi.post<Discount>("/discounts", discount);
  return response.data;
}

// Server-side functions
export async function fetchDiscounts(
  accessToken?: string
): Promise<{ discounts: Discount[], lastUpdated?: Date }> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Discount[]>("/discounts");
  console.log("Discounts fetched:", response.data);
  return {
    discounts: response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchActiveDiscounts(
  accessToken?: string
): Promise<Discount[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Discount[]>("/discounts");
  return response.data;
}

// ─── Client-side list (used by TanStack Query hooks) ──────────────────────────

export async function getDiscounts(): Promise<Discount[]> {
  const response = await clientApi.get<Discount[]>("/discounts");
  return response.data;
}

// ─── Client-side mutations ─────────────────────────────────────────────────────

export async function updateDiscount(
  id: string | number,
  data: Partial<Omit<Discount, "id">>
): Promise<Discount> {
  const res = await clientApi.put<Discount>(`/discounts/${id}`, data);
  return res.data;
}

export async function deleteDiscount(id: string | number): Promise<void> {
  await clientApi.delete(`/discounts/${id}`);
}
