import { clientApi, createServerApi } from "./config";

// Analytics Types
export interface TotalCounts {
  students: number;
  teachers: number;
  courses: number;
  activeSessions: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  currentMonthRevenue: number;
  revenueGrowth: number;
}

export interface TopCourse {
  id: number;
  title: string;
  enrollmentCount: number;
  revenue: number;
}

export interface DashboardOverview {
  totalCounts: TotalCounts;
  revenue: RevenueMetrics;
  topCourses: TopCourse[];
}

// Client-side functions
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await clientApi.get<DashboardOverview>("/analytics/dashboard");
  return response.data;
}

export async function getTotalCounts(): Promise<TotalCounts> {
  const response = await clientApi.get<TotalCounts>("/analytics/total-counts");
  return response.data;
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const response = await clientApi.get<RevenueMetrics>("/analytics/revenue");
  return response.data;
}

export async function getTopCourses(): Promise<TopCourse[]> {
  const response = await clientApi.get<TopCourse[]>("/analytics/top-courses");
  return response.data;
}

// Server-side functions
export async function fetchDashboardOverview(
  accessToken?: string
): Promise<{
  data: DashboardOverview;
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const response = await api.get<DashboardOverview>("/analytics/dashboard");
  
  return {
    data: response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchTotalCounts(
  accessToken?: string
): Promise<{
  data: TotalCounts;
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const response = await api.get<TotalCounts>("/analytics/total-counts");
  
  return {
    data: response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchRevenueMetrics(
  accessToken?: string
): Promise<{
  data: RevenueMetrics;
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const response = await api.get<RevenueMetrics>("/analytics/revenue");
  
  return {
    data: response.data,
    lastUpdated: response.lastFetched
  };
}

export async function fetchTopCourses(
  accessToken?: string
): Promise<{
  data: TopCourse[];
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const response = await api.get<TopCourse[]>("/analytics/top-courses");
  
  return {
    data: response.data,
    lastUpdated: response.lastFetched
  };
}
