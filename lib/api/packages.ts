import { Package, PackagePurchaseRequest } from "@/app/types/package.type";
import { clientApi, createServerApi } from "./config";

export interface PackageFilter {
  query?: string;
  status?: string;
  classMode?: string;
}

// Client-side functions
export async function purchasePackage(
  request: PackagePurchaseRequest
): Promise<Package> {
  const response = await clientApi.post<Package>("/packages", request);
  return response.data;
}

export async function getPackageById(packageId: number): Promise<Package> {
  try {
    const response = await clientApi.get<Package>(`/packages/${packageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching package ${packageId}:`, error);
    throw error;
  }
}

export async function applyPackage(
  packageId: number,
  courseId: number,
  courseName: string
): Promise<boolean> {
  try {
    const response = await clientApi.post(`/packages/${packageId}/apply`, {
      courseId,
      courseName,
      timestamp: new Date().toISOString(),
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error applying package:", error);
    return false;
  }
}

// Server-side functions
export async function fetchFilteredPackages(
  filters: PackageFilter,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{ packages: Package[]; pagination: any }> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.status) params.set("status", filters.status);
  if (filters.classMode) params.set("classMode", filters.classMode);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{ packages: Package[]; pagination: any }>(
    `/packages/filter?${params.toString()}`
  );
  return response.data;
}
