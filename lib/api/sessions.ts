import { SessionOverview } from "@/app/types/session.type";
import { clientApi, createServerApi } from "./config";

export interface SessionData {
  studentId: number;
  courseId: number;
  teacherId?: number;
  classOptionId: number;
  classCancel: number;
  payment: string;
  status: string;
  isFromPackage?: boolean;
  packageId?: number;
}

export interface UpdateSessionData {
  courseId: number;
  teacherId: number;
  classOptionId: number;
}

export interface StudentSessionFilter {
  courseName?: string;
  status?: string; // "completed" | "wip"
  payment?: string; // "paid" | "unpaid"
}

export interface TeacherSessionFilter {
  courseName?: string;
  status?: string; // "completed" | "wip"
}

// Client-side functions
export async function createSession(
  data: SessionData
): Promise<{ id: number }> {
  const res = await clientApi.post<{ id: number }>("/sessions", data);
  return res.data;
}

export async function updateSession(
  sessionId: number,
  data: UpdateSessionData
): Promise<{ success: boolean }> {
  const res = await clientApi.put<{ success: boolean }>(
    `/sessions/${sessionId}`,
    data
  );
  return res.data;
}

export async function getStudentSession(
  studentId: number
): Promise<SessionOverview[]> {
  const res = await clientApi.get<SessionOverview[]>(
    `/sessions/overview/${studentId}`
  );
  return res.data;
}

export async function getStudentSessionsFiltered(
  studentId: number,
  filters: StudentSessionFilter = {},
  page: number = 1,
  limit: number = 12,
  accessToken?: string
): Promise<{
  sessions: SessionOverview[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();

  if (filters.courseName) params.set("courseName", filters.courseName);
  if (filters.status) params.set("status", filters.status);
  if (filters.payment) params.set("payment", filters.payment);

  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const api = await createServerApi(accessToken);

  const res = await api.get<{
    sessions: SessionOverview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/sessions/student/${studentId}/filtered?${params.toString()}`);
  return res.data;
}

// Server-side functions for teacher sessions
export async function getTeacherSessionsFiltered(
  teacherId: number,
  filters: TeacherSessionFilter = {},
  page: number = 1,
  limit: number = 12,
  accessToken?: string
): Promise<{
  sessions: SessionOverview[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();

  if (filters.courseName) params.set("courseName", filters.courseName);
  if (filters.status) params.set("status", filters.status);

  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const api = await createServerApi(accessToken);

  const res = await api.get<{
    sessions: SessionOverview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/sessions/teacher/${teacherId}/filtered?${params.toString()}`);
  return res.data;
}

export async function changeSessionStatus(
  sessionId: string | number,
  status: string
): Promise<boolean> {
  try {
    const sessionIdStr = sessionId.toString();
    let endpoint: string;
    let actualId: string;

    // Check if it's courseplus (starts with cp-)
    if (sessionIdStr.startsWith("cp-")) {
      actualId = sessionIdStr.substring(3); // Remove 'cp-' prefix
      endpoint = `/courseplus/${actualId}`;
    } else {
      actualId = sessionIdStr;
      endpoint = `/sessions/${actualId}/status`;
    }

    const response = await clientApi.patch(endpoint, { status });
    return response.status === 200;
  } catch (error) {
    console.error("Error changing session status:", error);
    return false;
  }
}

export async function completeSession(sessionId: number): Promise<boolean> {
  try {
    await clientApi.patch(`/sessions/${sessionId}/status`, {
      status: "completed",
    });
    return true;
  } catch (error) {
    console.error("Error completing session:", error);
    return false;
  }
}

export async function cancelSession(sessionId: number): Promise<boolean> {
  try {
    await clientApi.patch(`/sessions/${sessionId}/cancel`, {
      status: "cancelled",
    });
    return true;
  } catch (error) {
    console.error("Error cancelling session:", error);
    return false;
  }
}

// Course Plus functionality
export async function addCoursePlus(
  sessionId: number,
  additionalClasses: number
): Promise<boolean> {
  try {
    const response = await clientApi.post("/sessions/course-plus", {
      sessionId,
      additionalClasses,
      timestamp: new Date().toISOString(),
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error adding course plus:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    }
    return false;
  }
}

// Feedback functionality
export async function submitTeacherFeedback(
  sessionId: number,
  studentId: number,
  feedback: string
): Promise<boolean> {
  try {
    const response = await clientApi.post("/sessions/feedback", {
      sessionId,
      studentId,
      feedback,
      timestamp: new Date().toISOString(),
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
}
