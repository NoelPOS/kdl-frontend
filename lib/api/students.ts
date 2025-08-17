import { Student } from "@/app/types/student.type";
import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function searchStudents(query: string): Promise<Student[]> {
  const response = await clientApi.get<Student[]>(
    `/students/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getStudentById(
  id: number,
  accessToken?: string
): Promise<Partial<Student>> {
  try {
    const api = await createServerApi(accessToken);
    const response = await api.get(`/students/${id}`);
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
    const response = await clientApi.put(`/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
}

type NewStudentData = Omit<Student, "id">;

export async function addNewStudent(student: NewStudentData): Promise<Student> {
  const response = await clientApi.post<Student>("/students", student);
  return response.data;
}

// Server-side functions
export async function fetchStudents(
  query?: string,
  active?: string,
  course?: string,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
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
  const api = await createServerApi(accessToken);
  const response = await api.get<{
    students: Student[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>("/students", {
    params: { query, active, course, page, limit },
  });
  return response.data;
}

export async function fetchActiveStudents(
  accessToken?: string
): Promise<Student[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Student[]>("/students/active");
  return response.data;
}

export async function fetchInactiveStudents(
  accessToken?: string
): Promise<Student[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Student[]>("/students/inactive");
  return response.data;
}
