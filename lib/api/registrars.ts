import { Registrar } from "@/app/types/registrar.type";
import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function searchRegistrars(query: string): Promise<Registrar[]> {
  const response = await clientApi.get<Registrar[]>(
    `/registrars?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getRegistrarById(
  id: number,
  accessToken?: string
): Promise<Partial<Registrar>> {
  const api = accessToken ? await createServerApi(accessToken) : clientApi;
  return api.get(`/registrars/${id}`).then((res) => res.data);
}

export async function updateRegistrarById(id: number, data: Partial<Registrar>) {
  return clientApi.put(`/registrars/${id}`, data).then((res) => res.data);
}

export async function deleteRegistrarById(id: number): Promise<void> {
  return clientApi.patch(`/registrars/${id}/role`, { role: "none" }).then((res) => res.data);
}

type NewRegistrarData = Omit<Registrar, "id"> & { password: string };

export async function addNewRegistrar(registrar: NewRegistrarData): Promise<Registrar> {
  const response = await clientApi.post<Registrar>("/registrars", registrar);
  return response.data;
}

// Server-side functions
export async function fetchRegistrars(
  query?: string,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  registrars: Registrar[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    registrars: Registrar[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/registrars/search?${params.toString()}`);
  return {
    ...response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchAllRegistrars(accessToken?: string): Promise<Registrar[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Registrar[]>("/registrars/all");
  return response.data;
}

// ─── Client-side list (used by TanStack Query hooks) ──────────────────────────

export interface RegistrarListFilters {
  query?: string;
  page?: number;
  limit?: number;
}

export async function getRegistrars(filters: RegistrarListFilters = {}): Promise<{
  registrars: Registrar[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const response = await clientApi.get<{
    registrars: Registrar[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>("/registrars/search", { params: filters });
  return response.data;
}
