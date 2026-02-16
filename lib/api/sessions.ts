
import { SessionOverview } from "@/app/types/session.type";
import { clientApi, createServerApi } from "./config";
import { SessionStatusUpdate } from "@/app/types/session.type";

export interface SessionData {
  studentId: number;
  courseId: number;
  teacherId?: number;
  classOptionId: number;
  classCancel: number;
  payment: string;
  status: string;
}

export interface UpdateSessionData {
  courseId?: number;
  teacherId?: number;
  classOptionId?: number;
  comment?: string;
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

export async function swapSessionType(
  sessionId: number,
  data: {
    classOptionId: number;
    newSchedules: any[];
  }
) {
  return clientApi
    .patch(`/sessions/${sessionId}/swap-type`, data)
    .then((res) => res.data);
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

// Create package API
export async function createPackage(data: { studentId: number; courseName: string; classOption: string }): Promise<{ success: boolean }> {
  // You can change the endpoint to match your backend implementation
  const res = await clientApi.post<{ success: boolean }>("/sessions/package", data);
  return res.data;
}

export async function checkStudentHasWipSession(
  studentId: number,
  courseId: number
): Promise<{ hasWipSession: boolean }> {
  console.log(
    "Checking WIP session for student:",
    studentId,
    "course:",
    courseId
  );
  const res = await clientApi.get<{ hasWipSession: boolean }>(
    `/sessions/student/${studentId}/course/${courseId}/has-wip`
  );

  console.log("WIP session check result:", res.data);
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
  lastUpdated?: Date;
}> {

  console.log("Access Token is here: ", accessToken);
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
  return {
    ...res.data,
    lastUpdated: res.lastFetched
  };
}

export async function changeSessionStatus(
  sessionId: string | number,
  statusUpdate: SessionStatusUpdate
): Promise<boolean> {
  try {
    const sessionIdStr = sessionId.toString();
    let endpoint: string;
    let actualId: string;

    // Check if it's courseplus (starts with cp-)
    if (sessionIdStr.startsWith("cp-")) {
      actualId = sessionIdStr.substring(3); // Remove 'cp-' prefix
      endpoint = `/course-plus/${actualId}`;
    } else {
      actualId = sessionIdStr;
      endpoint = `/sessions/${actualId}/status`;
    }

    const response = await clientApi.patch(endpoint, statusUpdate);
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
      timestamp: new Date().toLocaleDateString("en-GB"),
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
  feedback: string,
  feedbackImages?: string[],
  feedbackVideos?: string[]
): Promise<boolean> {
  try {
    const response = await clientApi.post("/sessions/feedback", {
      sessionId,
      studentId,
      feedback,
      timestamp: new Date().toISOString(),
      feedbackImages,
      feedbackVideos,
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
}
