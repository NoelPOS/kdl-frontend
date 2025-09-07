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
  title: string;
  enrollmentCount: number;
  revenue: number;
}

export interface DashboardOverview {
  totalCounts: TotalCounts;
  revenue: RevenueMetrics;
  topCourses: TopCourse[];
}

export interface AnalyticsResponse<T> {
  data: T;
  lastUpdated?: Date;
}
