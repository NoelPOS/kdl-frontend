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
): Promise<Discount[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Discount[]>("/discounts");
  console.log("Discounts fetched:", response.data);
  return response.data;
}

export async function fetchActiveDiscounts(
  accessToken?: string
): Promise<Discount[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Discount[]>("/discounts");
  return response.data;
}
