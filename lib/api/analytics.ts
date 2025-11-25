import { clientApi, createServerApi } from "./config";

// Analytics Types
export interface CourseTypeCount {
  subject: string;
  count: number;
}

export interface DashboardOverview {
  teacherClassCount?: number;
  courseTypeCounts?: CourseTypeCount[];
  activeStudentCount?: number;
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  teacherId?: number;
}

// Client-side functions
export async function getDashboardOverview(filter?: AnalyticsFilter): Promise<DashboardOverview> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.set("startDate", filter.startDate);
  if (filter?.endDate) params.set("endDate", filter.endDate);
  if (filter?.teacherId) params.set("teacherId", filter.teacherId.toString());

  const response = await clientApi.get<DashboardOverview>(`/analytics/dashboard?${params.toString()}`);
  return response.data;
}

// Server-side functions
export async function fetchDashboardOverview(
  accessToken?: string,
  filter?: AnalyticsFilter
): Promise<{
  data: DashboardOverview;
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  if (filter?.startDate) params.set("startDate", filter.startDate);
  if (filter?.endDate) params.set("endDate", filter.endDate);
  if (filter?.teacherId) params.set("teacherId", filter.teacherId.toString());

  const response = await api.get<DashboardOverview>(`/analytics/dashboard?${params.toString()}`);
  
  return {
    data: response.data,
    lastUpdated: response.lastFetched
  };
}
