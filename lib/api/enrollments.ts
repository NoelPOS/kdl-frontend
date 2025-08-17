import { Enrollment } from "@/app/types/enrollment.type";
import { clientApi, createServerApi } from "./config";

export interface EnrollmentFilter {
  date?: string;
  status?: string;
  course?: string;
  teacher?: string;
  student?: string;
  transactionType?: string; // "course" | "courseplus" | "package"
}

// Client-side functions
export async function searchEnrollments(query: string): Promise<Enrollment[]> {
  const response = await clientApi.get<Enrollment[]>(
    `/sessions/pending-invoice/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function fetchSpedificPendingInvoices(
  sessionId: number | string
): Promise<Enrollment> {
  const response = await clientApi.get<Enrollment>(
    `/sessions/pending-invoice/${sessionId}`
  );
  return response.data;
}

// Server-side functions
export async function fetchEnrollments(
  filter: EnrollmentFilter = {},
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  enrollments: Enrollment[];
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
  if (filter.date) params.set("date", filter.date);
  if (filter.status) params.set("status", filter.status);
  if (filter.course) params.set("course", filter.course);
  if (filter.teacher) params.set("teacher", filter.teacher);
  if (filter.student) params.set("student", filter.student);
  if (filter.transactionType)
    params.set("transactionType", filter.transactionType);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    enrollments: Enrollment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/sessions/pending-invoice?${params.toString()}`);
  console.log("Enrollments fetched:", response.data);
  return response.data;
}

export async function fetchPendingInvoices(
  accessToken?: string
): Promise<Enrollment[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Enrollment[]>("/sessions/pending-invoice");
  return response.data;
}
