import axios from "axios";
import { ClassSchedule } from "@/app/types/schedule.type";
import { ConflictDetail, Course } from "@/app/types/course.type";
import { Student } from "@/app/types/student.type";
import { SessionOverview } from "@/app/types/session.type";
import { Teacher } from "@/app/types/teacher.type";
import { Parent } from "@/app/types/parent.type";
import { Discount } from "@/app/types/discount.type";
import { LoginFormData } from "@/app/(auth)/login/page";
import { Enrollment, InvoiceSubmission } from "@/app/types/enrollment.type";
import { FetchAllInvoices, Invoice } from "@/app/types/invoice.type";
import { Package, PackagePurchaseRequest } from "@/app/types/package.type";

// Extend axios config to include metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: Date };
  }
}

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and performance monitoring
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

    if (duration > 2000) {
      console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
    }

    return response;
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export async function login(info: LoginFormData) {
  const response = await api.post("/auth/login", info);
  return response.data;
}

export async function fetchStudents(
  query?: string,
  active?: string,
  course?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  students: Student[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const response = await api.get<{
    students: Student[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>("/users/students", {
    params: { query, active, course, page, limit },
  });
  return response.data;
}

export async function searchStudents(query: string): Promise<Student[]> {
  const response = await api.get<Student[]>(
    `/users/students/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getStudentById(id: number): Promise<Partial<Student>> {
  try {
    const response = await api.get(`/users/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
}

export async function updateStudentById(
  id: number,
  studentData: Partial<Student>
): Promise<Student> {
  try {
    const response = await api.put(`/users/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
}

type NewStudentData = Omit<Student, "id">;

export async function addNewStudent(student: NewStudentData): Promise<Student> {
  const response = await api.post<Student>("/users/students", student);
  return response.data;
}

export async function fetchActiveStudents(): Promise<Student[]> {
  const response = await api.get<Student[]>("/users/students/active");
  return response.data;
}

export async function fetchInactiveStudents(): Promise<Student[]> {
  const response = await api.get<Student[]>("/users/students/inactive");
  return response.data;
}

type NewCourseData = Omit<Course, "id">;

export async function addNewCourse(course: NewCourseData): Promise<Course> {
  const response = await api.post<Course>("/courses", course);
  return response.data;
}

export interface CourseFilter {
  query?: string;
  ageRange?: string;
  medium?: string;
}

export async function fetchFilteredCourses(
  filter: CourseFilter = {},
  page: number = 1,
  limit: number = 10
): Promise<{
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (filter.query) params.set("query", filter.query);
  if (filter.ageRange) params.set("ageRange", filter.ageRange);
  if (filter.medium) params.set("medium", filter.medium);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    courses: Course[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/courses/filter?${params.toString()}`);
  return response.data;
}

export async function fetchCourses(
  page: number = 1,
  limit: number = 10
): Promise<{
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    courses: Course[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/courses?${params.toString()}`);
  return response.data;
}

export async function getCourseIdByCourseName(name: string): Promise<Course> {
  const response = await api.get<Course>(`/courses/${name}`);
  return response.data;
}

export async function getTeacherByCourseId(
  courseId: number
): Promise<Pick<Teacher, "id" | "name">[]> {
  const response = await api.get<Pick<Teacher, "id" | "name">[]>(
    `/users/teachers/course/${courseId}`
  );
  return response.data;
}

export async function getTeacherByName(
  name: string
): Promise<Pick<Teacher, "id" | "name">> {
  const response = await api.get<Pick<Teacher, "id" | "name">>(
    `/users/teachers/name/${encodeURIComponent(name)}`
  );
  return response.data;
}

export async function searchTeachers(query: string): Promise<Teacher[]> {
  const response = await api.get<Teacher[]>(
    `/users/teachers/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export interface Schedule {
  date?: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId?: number;
  courseId: number;
  studentId: number;
}

export async function createBulkSchedules(
  schedules: Schedule[]
): Promise<{ created: number }> {
  const res = await api.post<{ created: number }>("/schedules/bulk", schedules);
  return res.data;
}

export interface ScheduleConflictCheck {
  date?: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId?: number;
  studentId: number;
  excludeId?: number;
}

export async function checkScheduleConflict(
  params: ScheduleConflictCheck
): Promise<ConflictDetail> {
  const res = await api.post<ConflictDetail>("/schedules/conflict", params);
  return res.data;
}

interface BatchScheduleCheck {
  schedules: ScheduleConflictCheck[];
}

export async function checkScheduleConflicts(
  batch: BatchScheduleCheck
): Promise<ConflictDetail[]> {
  const res = await api.post<ConflictDetail[]>("/schedules/conflicts", batch);
  return res.data;
}

export async function getAllSchedules(): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>("/schedules");
  return res.data;
}

interface ScheduleUpdate {
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  teacherId?: number;
  courseId?: number;
  studentId?: number;
}

export async function updateSchedule(
  scheduleId: number,
  data: ScheduleUpdate
): Promise<Schedule> {
  const res = await api.patch<Schedule>(`/schedules/${scheduleId}`, data);
  return res.data;
}

export async function getTodaySchedules(): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>("/schedules/today");
  return res.data;
}

export interface ScheduleFilter {
  startDate?: string;
  endDate?: string;
  studentName?: string;
  teacherName?: string;
  courseName?: string;
  attendanceStatus?: string;
  classStatus?: string;
  room?: string;
  sessionMode?: string;
  sort?: string;
  classOption?: string;
}

export async function getFilteredSchedules(
  data: ScheduleFilter,
  page: number = 1,
  limit: number = 10
): Promise<{
  schedules: ClassSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (data.startDate) params.set("startDate", data.startDate);
  if (data.endDate) params.set("endDate", data.endDate);
  if (data.studentName) params.set("studentName", data.studentName);
  if (data.teacherName) params.set("teacherName", data.teacherName);
  if (data.courseName) params.set("courseName", data.courseName);
  if (data.attendanceStatus)
    params.set("attendanceStatus", data.attendanceStatus);
  if (data.classStatus) params.set("classStatus", data.classStatus);
  if (data.room) params.set("room", data.room);
  if (data.sort) params.set("sort", data.sort);
  if (data.classOption) params.set("classOption", data.classOption);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  console.log("API call URL:", `/schedules/filter?${params.toString()}`);
  console.log("Pagination params:", { page, limit });

  const res = await api.get<{
    schedules: ClassSchedule[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/schedules/filter?${params.toString()}`);
  console.log("API response:", res.data);
  return res.data;
}

export async function getSchedulesByStudentAndSession(
  sessionId: number,
  studentId: number
): Promise<ClassSchedule[]> {
  const res = await api.get<ClassSchedule[]>(
    `/schedules/session/${sessionId}/student/${studentId}`
  );
  console.log("API response:", res.data);
  return res.data;
}

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

export async function getCourseTypes(): Promise<
  {
    id: number;
    classMode: string;
    tuitionFee: number;
    classLimit: number;
  }[]
> {
  const res = await api.get<
    {
      id: number;
      classMode: string;
      tuitionFee: number;
      classLimit: number;
    }[]
  >("sessions/class-options");
  return res.data;
}

export async function createSession(
  data: SessionData
): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/sessions", data);
  return res.data;
}

export async function getStudentSession(
  studentId: number
): Promise<SessionOverview[]> {
  const res = await api.get<SessionOverview[]>(
    `/sessions/overview/${studentId}`
  );
  return res.data;
}

// Parent-Children relationship types and API functions
export interface ParentChild {
  id: number;
  parentId: number;
  studentId: number;
  isPrimary: boolean;
  student: Student;
}

export interface ParentChildFilter {
  query?: string;
}

export interface ConnectParentStudentData {
  parentId: number;
  studentId: number;
  isPrimary: boolean;
}

export async function getParentChildren(
  parentId: number,
  filter: ParentChildFilter = {},
  page: number = 1,
  limit: number = 12
): Promise<{
  children: ParentChild[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (filter.query) params.set("query", filter.query);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    children: ParentChild[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/users/parents/${parentId}/children?${params.toString()}`);
  return response.data;
}

export async function connectParentToStudent(
  data: ConnectParentStudentData
): Promise<ParentChild> {
  const response = await api.post<ParentChild>("/users/parent-children", data);
  return response.data;
}

export interface StudentSessionFilter {
  courseName?: string;
  status?: string; // "completed" | "wip"
  payment?: string; // "paid" | "unpaid"
}

export async function getStudentSessionsFiltered(
  studentId: number,
  filters: StudentSessionFilter = {},
  page: number = 1,
  limit: number = 12
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
      actualId = sessionIdStr.replace("cp-", "");
      endpoint = `/course-plus/${actualId}/status`;
    } else {
      // Regular course session
      endpoint = `/sessions/${sessionId}/payment`;
    }

    const response = await api.patch(endpoint, { status });
    return response.status === 200;
  } catch (error) {
    console.error("Error changing session status:", error);
    return false;
  }
}

export async function completeSession(sessionId: number): Promise<boolean> {
  try {
    await api.patch(`/sessions/${sessionId}`, { status: "completed" });
    return true;
  } catch (error) {
    console.error("Error completing session:", error);
    return false;
  }
}

// teachers
export async function fetchTeachers(
  query?: string,
  status?: string,
  course?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  teachers: Teacher[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status) params.set("status", status);
  if (course) params.set("course", course);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    teachers: Teacher[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/users/teachers?${params.toString()}`);
  return response.data;
}

export async function fetchAllTeachers(): Promise<Teacher[]> {
  const response = await api.get<Teacher[]>("/users/teachers/all");
  return response.data;
}

type NewTeacherData = Omit<Teacher, "id">;

export async function addNewTeacher(teacher: NewTeacherData): Promise<Teacher> {
  const response = await api.post<Teacher>("/users/teachers", teacher);
  return response.data;
}

export async function assignCoursesToTeacher(
  teacherId: number,
  courseIds: number[]
): Promise<void> {
  await api.post(`/users/teachers/${teacherId}/courses`, { courseIds });
}

// Get courses that a teacher can teach
export async function getTeacherCourses(
  teacherId: number,
  filter: { query?: string } = {},
  page: number = 1,
  limit: number = 12
): Promise<{
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (filter.query) params.set("query", filter.query);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    courses: Course[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/users/teachers/${teacherId}/courses?${params.toString()}`);
  return response.data;
}

// parents

export async function fetchParents(
  query?: string,
  child?: string,
  address?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  parents: Parent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (child) params.set("child", child);
  if (address) params.set("address", address);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    parents: Parent[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/users/parents/search?${params.toString()}`);
  return response.data;
}

export async function searchParents(query: string): Promise<Parent[]> {
  const response = await api.get<Parent[]>(
    `/users/parents/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

type NewParentData = Omit<Parent, "id">;

export async function addNewParent(parent: NewParentData): Promise<Parent> {
  const response = await api.post<Parent>("/users/parents", parent);
  return response.data;
}

export async function fetchAllParents(): Promise<Parent[]> {
  const response = await api.get<Parent[]>("/users/parents/all");
  return response.data;
}

// Discount API functions
export async function fetchDiscounts(): Promise<Discount[]> {
  const response = await api.get<Discount[]>("/discounts");
  console.log("Discounts fetched:", response.data);
  return response.data;
}

export async function searchDiscounts(query: string): Promise<Discount[]> {
  const response = await api.get<Discount[]>(
    `/discounts/search/${encodeURIComponent(query)}`
  );
  console.log("Discounts searched:", response.data);
  return response.data;
}

export async function getDiscountById(id: string): Promise<Partial<Discount>> {
  const response = await api.get<Partial<Discount>>(`/discounts/${id}`);
  return response.data;
}

type NewDiscountData = Omit<Discount, "id">;

export async function addNewDiscount(
  discount: NewDiscountData
): Promise<Discount> {
  const response = await api.post<Discount>("/discounts", discount);
  return response.data;
}

export async function fetchActiveDiscounts(): Promise<Discount[]> {
  const response = await api.get<Discount[]>("/discounts");
  return response.data;
}

// Enrollment API functions
export interface EnrollmentFilter {
  date?: string;
  status?: string;
  course?: string;
  teacher?: string;
  student?: string;
  transactionType?: string; // "course" | "courseplus" | "package"
}

export async function fetchEnrollments(
  filter: EnrollmentFilter = {},
  page: number = 1,
  limit: number = 10
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

export async function fetchPendingInvoices(): Promise<Enrollment[]> {
  const response = await api.get<Enrollment[]>("/sessions/pending-invoice");
  return response.data;
}

export async function fetchSpedificPendingInvoices(
  sessionId: number | string
): Promise<Enrollment> {
  const response = await api.get<Enrollment>(
    `/sessions/pending-invoice/${sessionId}`
  );
  return response.data;
}

export async function searchEnrollments(query: string): Promise<Enrollment[]> {
  const response = await api.get<Enrollment[]>(
    `/sessions/pending-invoice/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
}

// invoice API functions
export interface InvoiceFilter {
  documentId?: string;
  student?: string;
  course?: string;
  receiptDone?: string;
}

export async function fetchInvoices(
  filter: InvoiceFilter = {},
  page: number = 1,
  limit: number = 10
): Promise<{
  invoices: Invoice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (filter.documentId) params.set("documentId", filter.documentId);
  if (filter.student) params.set("student", filter.student);
  if (filter.course) params.set("course", filter.course);
  if (filter.receiptDone) params.set("receiptDone", filter.receiptDone);

  // Add pagination params
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    invoices: Invoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/sessions/invoices?${params.toString()}`);
  return response.data;
}

export async function addNewInvoice(
  invoice: InvoiceSubmission
): Promise<Invoice> {
  const response = await api.post<Invoice>("/sessions/invoices", invoice);
  return response.data;
}

export async function fetchAllInvoices(
  status?: string
): Promise<FetchAllInvoices> {
  console.log("Fetching invoices with status:", status);
  if (!status) {
    const response = await api.get<FetchAllInvoices>("/sessions/invoices");
    return response.data;
  }
  const response = await api.get<FetchAllInvoices>(
    `/sessions/invoices?receiptDone=${status}`
  );
  return response.data;
}

export async function getInvoiceById(id: number): Promise<Invoice> {
  const response = await api.get<Invoice>(`/sessions/invoices/${id}`);
  return response.data;
}

// receipt API functions
export async function createReceipt(
  invoiceId: number
): Promise<{ receiptId: number }> {
  const response = await api.post<{ receiptId: number }>(`/sessions/receipts`, {
    invoiceId,
    date: new Date().toISOString().split("T")[0],
  });
  return response.data;
}

export async function searchCourses(query: string): Promise<Course[]> {
  const response = await api.get<Course[]>(
    `/courses/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function fetchAllCourses(): Promise<Course[]> {
  const response = await api.get<Course[]>("/courses/all");
  return response.data;
}

export async function getParentById(id: number): Promise<Partial<Parent>> {
  return api.get(`/users/parents/${id}`).then((res) => res.data);
}

export async function updateParentById(id: number, data: Partial<Parent>) {
  return api.put(`/users/parents/${id}`, data).then((res) => res.data);
}

export async function getTeacherById(id: number): Promise<Partial<Teacher>> {
  return api.get(`/users/teachers/${id}`).then((res) => res.data);
}

export async function updateTeacherById(id: number, data: Partial<Teacher>) {
  return api.put(`/users/teachers/${id}`, data).then((res) => res.data);
}

// Course Plus functionality
export async function addCoursePlus(
  sessionId: number,
  additionalClasses: number
): Promise<boolean> {
  try {
    const response = await api.post("/sessions/course-plus", {
      sessionId,
      additionalClasses,
      timestamp: new Date().toISOString(), // Add timestamp for tracking
    });
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error adding course plus:", error);
    // Log additional details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return false;
  }
}

export interface PackageFilter {
  query?: string;
  status?: string;
  classMode?: string;
}

export async function fetchFilteredPackages(
  filters: PackageFilter,
  page: number = 1,
  limit: number = 10
): Promise<{ packages: Package[]; pagination: any }> {
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

export async function purchasePackage(
  request: PackagePurchaseRequest
): Promise<Package> {
  const response = await api.post<Package>("/packages", request);
  return response.data;
}

export async function getPackageById(packageId: number): Promise<Package> {
  try {
    const response = await api.get<Package>(`/packages/${packageId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching package:", error);
    throw error;
  }
}

export async function applyPackage(
  packageId: number,
  courseId: number,
  courseName: string
): Promise<boolean> {
  try {
    const response = await api.put(`/packages/${packageId}/apply`, {
      courseId,
      courseName,
      status: "used",
      isRedeemed: true,
      redeemedAt: new Date().toISOString(),
      redeemedCourseId: courseId,
      redeemedCourseName: courseName,
      updatedAt: new Date().toISOString(),
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error applying package:", error);
    return false;
  }
}
